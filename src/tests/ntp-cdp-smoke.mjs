/* global Buffer, process, setTimeout */
import {mkdir, writeFile} from 'node:fs/promises';

const chromeTargetsUrl = process.env.NTP_CHROME_TARGETS_URL ?? 'http://127.0.0.1:9223/json';
const appUrl = process.env.NTP_SMOKE_URL ?? 'http://127.0.0.1:5173/';
const artifactDirectory = process.env.NTP_PROOF_ARTIFACT_DIR ?? '/tmp';

await mkdir(artifactDirectory, {recursive: true});

const targets = await (await fetch(chromeTargetsUrl)).json();
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
        consoleProblems.push(message.params.exceptionDetails.exception?.description ?? message.params.exceptionDetails.text);
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

const waitFor = async (expression, timeoutMilliseconds = 8_000) => {
    const started = Date.now();
    let lastValue;
    while (Date.now() - started < timeoutMilliseconds) {
        lastValue = await evaluate(expression);
        if (lastValue) return lastValue;
        await wait(150);
    }
    throw new Error(`Timed out waiting for ${expression}. Last value: ${JSON.stringify(lastValue)}`);
};

const clickButton = (label) => evaluate(`(() => {
    const button = [...document.querySelectorAll('button')]
        .find((candidate) => (
            candidate.textContent.includes(${JSON.stringify(label)})
            || candidate.getAttribute('aria-label')?.includes(${JSON.stringify(label)})
            || candidate.getAttribute('title')?.includes(${JSON.stringify(label)})
        ));
    if (!button) {
        const labels = [...document.querySelectorAll('button')]
            .map((candidate) => candidate.getAttribute('aria-label') || candidate.textContent.trim())
            .filter(Boolean);
        throw new Error('Button not found: ${label}. Available: ' + labels.join(' | '));
    }
    button.scrollIntoView({block: 'center', inline: 'center'});
    button.click();
    return button.textContent.trim();
})()`);

const clickSceneToolbarButton = (label) => evaluate(`(() => {
    const button = [...document.querySelectorAll('.scene-view-toolbar button')]
        .find((candidate) => (
            candidate.textContent.includes(${JSON.stringify(label)})
            || candidate.getAttribute('aria-label')?.includes(${JSON.stringify(label)})
            || candidate.getAttribute('title')?.includes(${JSON.stringify(label)})
        ));
    if (!button) throw new Error('Scene toolbar button not found: ${label}');
    button.click();
    return button.textContent.trim();
})()`);

const selectEngineeringFocus = (value) => evaluate(`(() => {
    const select = document.querySelector('select[aria-label="Engineering focus"]');
    if (!select) throw new Error('Engineering focus selector not found.');
    select.value = ${JSON.stringify(value)};
    select.dispatchEvent(new Event('change', {bubbles: true}));
    return select.value;
})()`);

const assertState = (condition, message, detail = undefined) => {
    if (!condition) {
        throw new Error(detail === undefined ? message : `${message}: ${JSON.stringify(detail, null, 2)}`);
    }
};

const pageState = () => evaluate(`(() => {
    const canvas = document.querySelector('.engine-panel canvas');
    const canvasBox = canvas?.getBoundingClientRect();
    let canvasPixels = null;
    try {
        const gl = canvas?.getContext('webgl2') ?? canvas?.getContext('webgl');
        if (gl) {
            const width = gl.drawingBufferWidth;
            const height = gl.drawingBufferHeight;
            canvasPixels = {
                drawingBuffer: {width, height},
                contextLost: gl.isContextLost(),
            };
        }
    } catch (error) {
        canvasPixels = {error: String(error)};
    }

    const tabRects = [...document.querySelectorAll('.section-tab')]
        .map((tab) => {
            const rect = tab.getBoundingClientRect();
            return {label: tab.textContent.trim(), left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom};
        });
    const tabOverlaps = tabRects
        .slice(1)
        .filter((rect, index) => Math.abs(rect.top - tabRects[index].top) < 8 && rect.left < tabRects[index].right - 1)
        .map((rect) => rect.label);

    return {
        heading: document.querySelector('h1')?.textContent,
        activeSection: document.querySelector('.section-tab--active')?.textContent.trim(),
        tabs: [...document.querySelectorAll('.section-tab')].map((node) => node.textContent.trim()),
        horizontalOverflow: Math.max(
            document.documentElement.scrollWidth - window.innerWidth,
            document.body.scrollWidth - window.innerWidth,
        ),
        tabOverlaps,
        canvas: canvasBox ? {
            width: canvasBox.width,
            height: canvasBox.height,
            visible: canvasBox.width > 300 && canvasBox.height > 240,
        } : null,
        canvasPixels,
        fallbackVisible: Boolean(document.querySelector('.scene-webgl-fallback')),
        text: document.body.textContent.replace(/\\s+/g, ' ').trim(),
    };
})()`);

const assertHealthyShell = (state, viewport, options = {}) => {
    assertState(state.heading === 'SNP Engine Systems Analysis Workbench', 'Unexpected app heading', state.heading);
    assertState(
        JSON.stringify(state.tabs) === JSON.stringify(['Operating Case', 'Nuclear Fuel Performance', 'Model Evidence', 'Review']),
        'Primary tabs are not the v3 nuclear-first set',
        state.tabs,
    );
    assertState(!state.tabs.includes('Stability'), 'Stability is still present in primary navigation', state.tabs);
    assertState(state.horizontalOverflow <= 6, `Page has horizontal overflow at ${viewport.width}x${viewport.height}`, state.horizontalOverflow);
    assertState(state.tabOverlaps.length === 0, 'Primary navigation tabs overlap', state.tabOverlaps);
    if (options.requireScene) {
        assertState(state.canvas?.visible, '3D scene canvas is missing or too small', state.canvas);
        assertState(!state.fallbackVisible, 'WebGL fallback is visible instead of the 3D scene');
    }
};

const assertAccessibleSurface = (titleId, landmarkLabel) => evaluate(`(() => {
    const title = document.getElementById(${JSON.stringify(titleId)});
    const landmark = [...document.querySelectorAll('section, main, aside')]
        .find((element) => element.getAttribute('aria-label') === ${JSON.stringify(landmarkLabel)});
    const unlabeledButtons = [...document.querySelectorAll('button')]
        .filter((button) => !button.disabled && !button.textContent.trim() && !button.getAttribute('aria-label'));
    return {
        titleIsHeading: /^H[1-6]$/.test(title?.tagName ?? ''),
        landmarkFound: Boolean(landmark),
        unlabeledButtons: unlabeledButtons.length,
    };
})()`);

const assertAccessible = async (titleId, landmarkLabel) => {
    const result = await assertAccessibleSurface(titleId, landmarkLabel);
    assertState(result.titleIsHeading, `Accessible heading missing for ${titleId}`, result);
    assertState(result.landmarkFound, `Accessible landmark missing for ${landmarkLabel}`, result);
    assertState(result.unlabeledButtons === 0, 'Interactive controls include unlabeled buttons', result);
};

const cycles = [
    {width: 1280, height: 720, suffix: '1280x720'},
    {width: 1024, height: 768, suffix: '1024x768'},
    {width: 390, height: 844, suffix: '390x844', mobile: true},
];

const reports = [];

await send('Page.enable');
await send('Runtime.enable');
await send('Log.enable');

for (const viewport of cycles) {
    await send('Emulation.setDeviceMetricsOverride', {
        width: viewport.width,
        height: viewport.height,
        deviceScaleFactor: 1,
        mobile: Boolean(viewport.mobile),
    });
    await send('Page.navigate', {url: appUrl});
    await waitFor(`Boolean(document.querySelector('.app-shell'))`);
    await wait(1_800);

    const initial = await pageState();
    assertHealthyShell(initial, viewport, {requireScene: true});
    assertState(initial.activeSection.includes('Operating Case'), 'App does not start on Operating Case', initial.activeSection);
    await assertAccessible('operating-case-title', 'Operating case decision record');
    await evaluate(`(() => {
        const control = document.querySelector('input[type="range"]');
        if (!control) throw new Error('Custom What-If range control is missing.');
        control.value = String(Number(control.value) + Number(control.step || 1));
        control.dispatchEvent(new Event('input', {bubbles: true}));
        control.dispatchEvent(new Event('change', {bubbles: true}));
    })()`);
    await wait(250);
    const customWhatIf = await evaluate(`(() => ({
        notice: document.body.textContent.includes('Custom What-If'),
        rollback: [...document.querySelectorAll('button')].some((button) => button.textContent.includes('Rollback to')),
    }))()`);
    assertState(customWhatIf.notice && customWhatIf.rollback, 'Custom What-If journey did not expose provenance and rollback', customWhatIf);
    const initialSceneStats = await writeCanvasScreenshot(`ntp-v3-operating-scene-${viewport.suffix}`);

    await selectEngineeringFocus('fuel-performance');
    await wait(500);
    await clickSceneToolbarButton('Reactor');
    await wait(500);
    await clickSceneToolbarButton('Evidence');
    await evaluate(`(() => {
        if (!document.querySelector('.scene-selection-card')) {
            [...document.querySelectorAll('.scene-view-toolbar button')]
                .find((button) => button.textContent.includes('Details'))
                ?.click();
        }
    })()`);
    await wait(500);
    const sceneFocus = await evaluate(`(() => ({
        selectedComponent: document.querySelector('.scene-selection-card h3')?.textContent,
        inspectorTitle: document.querySelector('#evidence-inspector-title')?.textContent,
        inspectorSource: document.querySelector('.evidence-inspector__source')?.textContent.trim(),
        activeViews: [...document.querySelectorAll('.scene-view-toolbar button[aria-pressed="true"]')]
            .map((button) => button.textContent.trim()),
    }))()`);
    assertState(sceneFocus.selectedComponent === 'Fuel performance', 'Scene focus did not select fuel performance', sceneFocus);
    assertState(sceneFocus.activeViews?.some((label) => label.includes('Evidence')), 'Evidence cutaway did not activate', sceneFocus);

    await clickButton('Nuclear Fuel Performance');
    await waitFor(`document.querySelector('#nuclear-fuel-performance-title')?.textContent === 'Nuclear Fuel Performance'`);
    await wait(400);
    const nuclear = await pageState();
    assertHealthyShell(nuclear, viewport);
    for (const required of [
        'BISON and MCNP burnup handoff',
        'Peak fuel temperature',
        '2,966.5',
        'Peak restart temperature',
        '2,608.1',
        'Coating margin',
        '0.68',
        'Hydrogen attack margin',
        '0.72',
        'Final burnup proxy',
        '0.06728',
        'Final damage index',
        '6.58e-6',
        'k-effective trend: 1.01039 -> 0.99284',
        'Peak xenon worth: -742 pcm',
        '+100 s decay heat: 0.0158 normalized',
        'not validated fuel qualification',
    ]) {
        assertState(nuclear.text.includes(required), `Nuclear Fuel Performance copy missing: ${required}`);
    }
    await writeScreenshot(`ntp-v3-nuclear-${viewport.suffix}`);

    await clickButton('Model Evidence');
    await waitFor(`document.querySelector('#model-evidence-title')?.textContent === 'Model Evidence'`);
    await wait(400);
    const modelEvidence = await pageState();
    assertHealthyShell(modelEvidence, viewport);
    await assertAccessible('model-evidence-title', 'Engineering fixture evidence');
    for (const required of ['BISON (2)', 'MCNP (4)', 'MOOSE (2)', 'ROCETS (2)', 'MCNP burnup and restart memory']) {
        assertState(modelEvidence.text.includes(required), `Model Evidence copy missing: ${required}`);
    }

    await clickButton('Start tour');
    await wait(450);
    const firstTourStep = await evaluate(`(() => ({
        title: document.querySelector('.evidence-walkthrough__heading h3')?.textContent,
        focusedArtifact: document.querySelector('.focused-evidence')?.dataset.evidenceId,
        richPanel: document.querySelector('.rich-evidence-panel h3')?.textContent,
    }))()`);
    assertState(firstTourStep.title === 'MCNP burnup and restart memory', 'First tour step should be MCNP burnup/restart', firstTourStep);
    assertState(firstTourStep.focusedArtifact === 'mcnp-criticality-output', 'First tour focus should be MCNP criticality output', firstTourStep);
    assertState(firstTourStep.richPanel === 'MCNP Burnup Evidence', 'MCNP rich panel did not render', firstTourStep);

    await clickButton('Next');
    await wait(450);
    const secondTourStep = await evaluate(`(() => ({
        title: document.querySelector('.evidence-walkthrough__heading h3')?.textContent,
        focusedArtifact: document.querySelector('.focused-evidence')?.dataset.evidenceId,
        focusLabel: document.querySelector('.evidence-focus-toolbar span')?.textContent,
        richPanel: document.querySelector('.rich-evidence-panel h3')?.textContent,
        text: document.body.textContent.replace(/\\s+/g, ' ').trim(),
    }))()`);
    assertState(secondTourStep.title === 'BISON fuel performance', 'Second tour step should be BISON fuel performance', secondTourStep);
    assertState(secondTourStep.focusedArtifact === 'bison-output', 'Second tour focus should be BISON output', secondTourStep);
    assertState(secondTourStep.focusLabel?.includes('BISON fuel-performance evidence in inspection view'), 'BISON inspection toolbar missing', secondTourStep);
    assertState(secondTourStep.richPanel === 'BISON Fuel Performance Evidence', 'BISON rich panel did not render', secondTourStep);
    assertState(secondTourStep.text.includes('Final fuel-performance review summary'), 'BISON final review table missing');
    await writeScreenshot(`ntp-v3-model-evidence-${viewport.suffix}`);

    await clickButton('Review');
    await waitFor(`document.querySelector('#review-title')?.textContent === 'Integrated Engineering Review'`);
    await evaluate(`window.__ntpSmokePrintCalls = 0; window.print = () => { window.__ntpSmokePrintCalls += 1; };`);
    await clickButton('Print focused review');
    await wait(200);
    const review = await pageState();
    const reviewExtras = await evaluate(`(() => ({
        printCalls: window.__ntpSmokePrintCalls,
        focusedEvidenceCount: document.querySelectorAll('.evidence-register__focused').length,
    }))()`);
    assertHealthyShell(review, viewport);
    await assertAccessible('review-title', 'Integrated engineering review');
    for (const required of [
        'Compact Stability Disposition',
        'ROCETS stability support',
        'not a qualified margin',
        'Constraint Handoff',
        'BISON',
        'ntp.bison.o',
    ]) {
        assertState(review.text.includes(required), `Review copy missing: ${required}`);
    }
    assertState(reviewExtras.printCalls === 1, 'Review print path did not call window.print once', reviewExtras);
    assertState(reviewExtras.focusedEvidenceCount > 0, 'Review evidence register did not mark focused evidence', reviewExtras);
    await writeScreenshot(`ntp-v3-review-${viewport.suffix}`);

    reports.push({
        viewport,
        initial: {...pickShellFields(initial), sceneScreenshot: initialSceneStats},
        sceneFocus,
        nuclear: {
            activeSection: nuclear.activeSection,
            hasFuelValues: true,
        },
        tour: {firstTourStep, secondTourStep: {
            title: secondTourStep.title,
            focusedArtifact: secondTourStep.focusedArtifact,
            richPanel: secondTourStep.richPanel,
        }},
        review: {
            activeSection: review.activeSection,
            printCalls: reviewExtras.printCalls,
            focusedEvidenceCount: reviewExtras.focusedEvidenceCount,
        },
    });
}

const actionableConsoleProblems = consoleProblems.filter((problem) => (
    !problem.includes('Failed to load resource: the server responded with a status of 404') &&
    !problem.includes('THREE.Clock: This module has been deprecated') &&
    !problem.includes('GPU stall due to ReadPixels')
));
assertState(actionableConsoleProblems.length === 0, 'Browser console reported warnings or errors', actionableConsoleProblems);

console.log(JSON.stringify({appUrl, reports, consoleProblems: actionableConsoleProblems}, null, 2));
socket.close();

async function writeScreenshot(label) {
    const screenshot = await send('Page.captureScreenshot', {format: 'png'});
    await writeFile(`${artifactDirectory}/${label}.png`, Buffer.from(screenshot.result.data, 'base64'));
}

async function writeCanvasScreenshot(label) {
    await evaluate(`document.querySelector('.engine-panel')?.scrollIntoView({block: 'center', inline: 'nearest'});`);
    await wait(350);
    const started = Date.now();
    let lastStats = null;
    let lastScreenshotData = null;
    while (Date.now() - started < 10_000) {
        const {screenshotData, stats} = await captureCanvasScreenshotStats();
        lastStats = stats;
        lastScreenshotData = screenshotData;
        if (sceneStatsLookNonBlank(stats)) {
            await writeFile(`${artifactDirectory}/${label}.png`, Buffer.from(screenshotData, 'base64'));
            return stats;
        }
        await wait(500);
    }

    if (lastScreenshotData) {
        await writeFile(`${artifactDirectory}/${label}.png`, Buffer.from(lastScreenshotData, 'base64'));
    }
    assertState(false, 'Canvas screenshot appears visually blank', lastStats);
}

async function captureCanvasScreenshotStats() {
    const rect = await evaluate(`(() => {
        const box = document.querySelector('.scene-silhouette__assembly')?.getBoundingClientRect()
            ?? document.querySelector('.engine-panel canvas')?.getBoundingClientRect();
        if (!box) return null;
        return {
            x: Math.max(0, box.x),
            y: Math.max(0, box.y),
            width: Math.max(1, box.width),
            height: Math.max(1, box.height),
        };
    })()`);
    assertState(rect, 'Cannot capture scene screenshot because the scene region is missing');
    const screenshot = await send('Page.captureScreenshot', {format: 'png'});

    const stats = await evaluate(`(async () => {
        const image = new Image();
        image.src = 'data:image/png;base64,${screenshot.result.data}';
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d', {willReadFrequently: true});
        context.drawImage(image, 0, 0);
        const rect = ${JSON.stringify(rect)};
        const samples = [];
        for (let y = 0.18; y <= 0.82; y += 0.08) {
            for (let x = 0.18; x <= 0.82; x += 0.08) {
                const pixel = context.getImageData(
                    Math.max(0, Math.min(canvas.width - 1, Math.round(rect.x + rect.width * x))),
                    Math.max(0, Math.min(canvas.height - 1, Math.round(rect.y + rect.height * y))),
                    1,
                    1,
                ).data;
                samples.push([...pixel]);
            }
        }
        const luminances = samples.map(([r, g, b]) => Math.round((0.2126 * r) + (0.7152 * g) + (0.0722 * b)));
        return {
            imageSize: {width: image.width, height: image.height},
            sampleRegion: rect,
            unique: new Set(samples.map((sample) => sample.join(','))).size,
            luminanceRange: Math.max(...luminances) - Math.min(...luminances),
            brightSamples: luminances.filter((value) => value > 30).length,
        };
    })()`);
    return {screenshotData: screenshot.result.data, stats};
}

function sceneStatsLookNonBlank(stats) {
    return stats.unique > 8 || stats.luminanceRange > 24 || stats.brightSamples > 8;
}

function pickShellFields(state) {
    return {
        activeSection: state.activeSection,
        tabs: state.tabs,
        horizontalOverflow: state.horizontalOverflow,
        canvas: state.canvas,
        canvasPixels: state.canvasPixels ? {
            drawingBuffer: state.canvasPixels.drawingBuffer,
            contextLost: state.canvasPixels.contextLost,
        } : null,
    };
}
