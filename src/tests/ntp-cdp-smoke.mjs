/* global Buffer, setTimeout */
import {writeFile} from 'node:fs/promises';

const targets = await (await fetch('http://127.0.0.1:9223/json')).json();
const target = targets.find((item) => item.type === 'page');
if (!target) throw new Error('No Chrome page target found.');

const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve) => socket.addEventListener('open', resolve, {once: true}));

let id = 1;
const pending = new Map();
const consoleProblems = [];

socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
    }
    if (message.method === 'Runtime.exceptionThrown') {
        consoleProblems.push(message.params.exceptionDetails.text);
    }
    if (message.method === 'Log.entryAdded' && ['error', 'warning'].includes(message.params.entry.level)) {
        consoleProblems.push(`${message.params.entry.level}: ${message.params.entry.text}`);
    }
});

const send = (method, params = {}) => new Promise((resolve) => {
    const requestId = id++;
    pending.set(requestId, resolve);
    socket.send(JSON.stringify({id: requestId, method, params}));
});

const evaluate = async (expression) => {
    const message = await send('Runtime.evaluate', {
        expression,
        awaitPromise: true,
        returnByValue: true,
    });
    if (message.result?.exceptionDetails) {
        throw new Error(
            message.result.exceptionDetails.exception?.description
            ?? message.result.exceptionDetails.text,
        );
    }
    return message.result?.result?.value;
};

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const clickButton = (label) => evaluate(`(() => {
    const button = [...document.querySelectorAll('button')]
        .find((candidate) => (
            candidate.textContent.includes(${JSON.stringify(label)})
            || candidate.getAttribute('aria-label')?.includes(${JSON.stringify(label)})
        ));
    if (!button) {
        const labels = [...document.querySelectorAll('button')]
            .map((candidate) => candidate.getAttribute('aria-label') || candidate.textContent.trim())
            .filter(Boolean);
        throw new Error('Button not found: ${label}. Available: ' + labels.join(' | '));
    }
    button.click();
    return button.textContent.trim();
})()`);
const selectFocus = (value) => evaluate(`(() => {
    const select = document.querySelector('select[aria-label="Engineering focus"]')
        ?? [...document.querySelectorAll('label')].find((candidate) => candidate.textContent.includes('Evidence focus'))?.querySelector('select');
    if (!select) throw new Error('Engineering focus selector not found');
    select.value = ${JSON.stringify(value)};
    select.dispatchEvent(new Event('change', {bubbles: true}));
    return select.value;
})()`);

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');

const cycles = [
    {width: 1280, height: 720, suffix: '1280'},
    {width: 1024, height: 768, suffix: '1024'},
];

const reports = [];

for (const [index, cycle] of cycles.entries()) {
    await send('Emulation.setDeviceMetricsOverride', {
        width: cycle.width,
        height: cycle.height,
        deviceScaleFactor: 1,
        mobile: false,
    });
    await send('Page.navigate', {url: 'http://127.0.0.1:5174/'});
    await wait(1800);

    await clickButton('Baseline Startup');
    await wait(350);
    const baseline = await evaluate(`(() => ({
        heading: document.querySelector('.scene-command-bar h2')?.textContent,
        caseLabel: document.querySelector('.scene-case-label')?.textContent,
        canvasCount: document.querySelectorAll('.engine-panel canvas').length,
        claimBoundary: document.querySelector('.scene-claim-boundary')?.textContent,
        visibleCallouts: document.querySelectorAll('.scene-callout').length,
        detailsCollapsed: !document.querySelector('.scene-selection-card'),
        viewControls: [...document.querySelectorAll('.scene-view-toolbar button')]
            .map((button) => button.textContent.trim()),
        canvasHeight: document.querySelector('.engine-panel canvas')?.getBoundingClientRect().height,
        inspectorTitle: document.querySelector('#evidence-inspector-title')?.textContent,
        inspectorSource: document.querySelector('.evidence-inspector__source')?.textContent.trim(),
        fallbackVisible: Boolean(document.querySelector('.scene-webgl-fallback')),
    }))()`);
    await evaluate(`document.querySelector('.engine-panel')?.scrollIntoView({block: 'center'})`);
    await wait(250);
    const baselineShot = await send('Page.captureScreenshot', {format: 'png'});
    await writeFile(`/private/tmp/ntp-geometry-baseline-${cycle.suffix}.png`, Buffer.from(baselineShot.result.data, 'base64'));
    await clickButton('Reactor');
    await wait(1_000);
    await clickButton('Exploded');
    await wait(250);
    const cutawayControls = await evaluate(`(() => ({
        activeView: document.querySelector('.scene-view-toolbar button[aria-pressed="true"]')?.textContent.trim(),
        exploded: [...document.querySelectorAll('.scene-view-toolbar button')]
            .find((button) => button.textContent.includes('Exploded'))?.getAttribute('aria-pressed'),
    }))()`);
    const explodedShot = await send('Page.captureScreenshot', {format: 'png'});
    await writeFile(`/private/tmp/ntp-geometry-exploded-${cycle.suffix}.png`, Buffer.from(explodedShot.result.data, 'base64'));
    await clickButton('Reset View');
    await wait(1_000);
    await clickButton('Flow Path');
    await wait(1_000);
    const flowShot = await send('Page.captureScreenshot', {format: 'png'});
    await writeFile(`/private/tmp/ntp-geometry-flow-${cycle.suffix}.png`, Buffer.from(flowShot.result.data, 'base64'));
    await clickButton('Reset View');
    await wait(1_000);
    await clickButton('Show Details');
    await selectFocus('reactor-criticality');
    await wait(250);
    const criticalitySelection = await evaluate(`(() => ({
        selectedComponent: document.querySelector('.scene-selection-card h3')?.textContent,
        inspectorTitle: document.querySelector('#evidence-inspector-title')?.textContent,
        inspectorSource: document.querySelector('.evidence-inspector__source')?.textContent.trim(),
        tableRows: document.querySelectorAll('.evidence-review-table tbody tr').length,
    }))()`);
    await clickButton('Open full parsed records');
    await wait(250);
    const modelEvidence = await evaluate(`(() => ({
        thread: document.querySelector('.investigation-thread h2')?.textContent,
        focusedArtifact: document.querySelector('.focused-evidence')?.dataset.evidenceId,
        focusedLabel: document.querySelector('.focused-evidence h2')?.textContent,
    }))()`);
    await clickButton('Return to engine view');
    await wait(250);
    const canvasBox = await evaluate(`(() => {
        const box = document.querySelector('.engine-panel canvas')?.getBoundingClientRect();
        return box ? {x: box.x, y: box.y, width: box.width, height: box.height} : null;
    })()`);
    if (!canvasBox) throw new Error('Scene canvas bounds unavailable.');
    const dragStart = {x: canvasBox.x + canvasBox.width * 0.62, y: canvasBox.y + canvasBox.height * 0.48};
    const dragEnd = {x: dragStart.x + 70, y: dragStart.y - 28};
    await send('Input.dispatchMouseEvent', {...dragStart, type: 'mousePressed', button: 'left', clickCount: 1});
    await send('Input.dispatchMouseEvent', {...dragEnd, type: 'mouseMoved', button: 'left'});
    await send('Input.dispatchMouseEvent', {...dragEnd, type: 'mouseReleased', button: 'left', clickCount: 1});
    await wait(400);
    const preTourPose = await evaluate(`(() => ({
        position: document.querySelector('.scene-stage')?.dataset.cameraPosition,
        target: document.querySelector('.scene-stage')?.dataset.cameraTarget,
    }))()`);

    await clickButton('Play guided visualization');
    await wait(450);
    await clickButton('Pause');
    await wait(150);
    const paused = await evaluate(`(() => ({
        label: document.querySelector('.theatre-smoke-status')?.textContent.trim(),
        status: document.querySelector('[data-scope="theatre-demo-director"]')?.dataset.playbackStatus,
    }))()`);
    await clickButton('Resume');
    await wait(3_500);
    const firstWaiting = await evaluate(`(() => ({
        status: document.querySelector('[data-scope="theatre-demo-director"]')?.dataset.playbackStatus,
        step: document.querySelector('.theatre-cue-card span')?.textContent,
        title: document.querySelector('.theatre-cue-card strong')?.textContent,
    }))()`);
    await clickButton('Stop');
    await wait(1_000);
    const stopped = await evaluate(`(() => ({
        status: document.querySelector('[data-scope="theatre-demo-director"]')?.dataset.playbackStatus,
        restoredSelection: document.querySelector('.scene-selection-card h3')?.textContent,
        restoredPosition: document.querySelector('.scene-stage')?.dataset.cameraPosition,
        restoredTarget: document.querySelector('.scene-stage')?.dataset.cameraTarget,
    }))()`);
    await clickButton('Play guided visualization');
    const tourSteps = [];
    for (let step = 0; step < 4; step += 1) {
        await wait(3_500);
        tourSteps.push(await evaluate(`(() => ({
            status: document.querySelector('[data-scope="theatre-demo-director"]')?.dataset.playbackStatus,
            step: document.querySelector('.theatre-cue-card span')?.textContent,
            title: document.querySelector('.theatre-cue-card strong')?.textContent,
            interpretation: document.querySelector('.theatre-cue-card p')?.textContent,
        }))()`));
        await clickButton(step === 3 ? 'Finish' : 'Next');
    }
    await wait(1_000);
    const guided = await evaluate(`(() => ({
        playbackStatus: document.querySelector('[data-scope="theatre-demo-director"]')?.dataset.playbackStatus,
        activeCaption: document.querySelector('.scene-caption')?.textContent.trim(),
        restoredSelection: document.querySelector('.scene-selection-card h3')?.textContent,
        restoredCameraOwner: document.querySelector('.scene-stage')?.dataset.cameraOwner,
        restoredPosition: document.querySelector('.scene-stage')?.dataset.cameraPosition,
        restoredTarget: document.querySelector('.scene-stage')?.dataset.cameraTarget,
    }))()`);

    await clickButton('Thermal Margin Investigation');
    await wait(450);
    const thermal = await evaluate(`(() => ({
        caseLabel: document.querySelector('.scene-case-label')?.textContent,
        calloutText: [...document.querySelectorAll('.scene-callout')].map((node) => node.textContent.trim()),
        activeCaseButtons: [...document.querySelectorAll('.case-choice.active')].map((node) => node.textContent.trim()),
        interpretation: document.querySelector('.scene-caption')?.textContent.trim(),
        inspectorTitle: document.querySelector('#evidence-inspector-title')?.textContent,
        activeView: document.querySelector('.scene-stage')?.dataset.presentationPreset,
    }))()`);
    await evaluate(`document.querySelector('.engine-panel')?.scrollIntoView({block: 'center'})`);
    await wait(250);
    const thermalShot = await send('Page.captureScreenshot', {format: 'png'});
    await writeFile(`/private/tmp/ntp-geometry-thermal-${cycle.suffix}.png`, Buffer.from(thermalShot.result.data, 'base64'));
    await clickButton('Stability:');
    await wait(200);
    const stabilityThread = await evaluate(`(() => ({
        thread: document.querySelector('.investigation-thread h2')?.textContent,
        evidenceInterpretation: document.querySelector('.review-callout p:not(.eyebrow)')?.textContent,
    }))()`);
    await clickButton('Review:');
    await wait(200);
    const reviewDossier = await evaluate(`(() => ({
        thread: document.querySelector('.investigation-thread h2')?.textContent,
        selectedInvestigation: [...document.querySelectorAll('.review-decision-grid section')]
            .find((section) => section.querySelector('h3')?.textContent === 'Selected investigation')
            ?.textContent.trim(),
        focusedEvidenceCount: document.querySelectorAll('.evidence-register__focused').length,
        printButton: document.querySelector('.review-summary__actions button')?.textContent,
    }))()`);
    await clickButton('Reset Demo');
    await wait(200);
    const reset = await evaluate(`(() => ({
        currentCase: document.querySelector('.case-status-panel strong')?.textContent,
        activeSection: document.querySelector('.section-tab--active')?.textContent,
        selectedFocus: document.querySelector('select[aria-label="Engineering focus"]')?.value,
        activeView: document.querySelector('.scene-view-toolbar button[aria-pressed="true"]')?.textContent.trim(),
        detailsCollapsed: !document.querySelector('.scene-selection-card'),
        playbackStatus: document.querySelector('[data-scope="theatre-demo-director"]')?.dataset.playbackStatus,
    }))()`);
    reports.push({
        cycle: index + 1,
        viewport: cycle,
        baseline,
        cutawayControls,
        criticalitySelection,
        modelEvidence,
        preTourPose,
        paused,
        firstWaiting,
        stopped,
        tourSteps,
        guided,
        thermal,
        stabilityThread,
        reviewDossier,
        reset,
    });
}

console.log(JSON.stringify({reports, consoleProblems}, null, 2));
socket.close();
