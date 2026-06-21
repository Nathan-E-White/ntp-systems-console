TITLE     = "ROCETS TRANSIENT PERFORMANCE CURVES - ENGINE STARTUP"
VARIABLES = "TIME", "P_CHAMBER", "T_CHAMBER", "PARA_FRACTION", "RPM"

! ====================================================================
! ZONE 1: TRANSIENT IGNITION PHASE (t = 0.0 to 0.05 seconds)
! ====================================================================
ZONE T="Ignition Transient", I=6, F=POINT

! Note: Data is structured sequentially matching the VARIABLES header
! TIME(S)   P_CHAMBER(PSI) T_CHAMBER(R) PARA_FRAC     RPM
  0.0000     14.7000        530.000      0.998000       0.00
  0.0100     54.1250       1420.104      0.997845     890.11
  0.0200    412.5123       4890.115      0.989451   12450.11
  0.0300    985.4120       5910.420      0.941250   29140.54
  0.0400   1200.4512       6000.410      0.938401   35010.41
  0.0500   1200.0000       6000.000      0.938400   35000.00

! ====================================================================
! ZONE 2: THROTTLE DOWN PHASE (t = 0.5 to 1.0 seconds)
! ====================================================================
! Splitting the run into a separate 'Zone' tells the plotting program
! to overlay a distinct visual line or change the grid colors.
ZONE T="Throttle Down Sequence", I=4, F=POINT

! TIME(S)   P_CHAMBER(PSI) T_CHAMBER(R) PARA_FRAC     RPM
  0.5000   1200.0000       6000.000      0.938400   35000.00
  0.6000    950.1120       5450.210      0.951200   28450.11
  0.7000    780.4501       5120.450      0.968940   22780.45
  1.0000    780.0000       5110.000      0.969100   22750.00
