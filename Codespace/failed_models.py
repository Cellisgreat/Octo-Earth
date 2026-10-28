"""OCTO-EARTH - four displayed failed attempts for moving Earth from 1 AU to 2.7 AU in 10,000 years (update p40).

Independent of the asteroid-launcher model in octoearth_rl.py. Model 1 merges the laser-push and Dyson-beam
calculations; models 2 and 3 are hydrogen harvesting and superconducting Lorentz arms; model 4 uses thrusters
with reaction mass removed from Earth. The formulas match frontend/failedPhysics.js; a test compares their numbers.

    python failed_models.py          prints the four verdicts and component numbers

1  Dyson-powered laser + arm-held collector  F = P/c, (P/c)(d-r) -> arms fail; beam heats Earth; still too weak
2  Hydrogen harvesting + fusion rocket       rocket eq.   -> even the whole solar wind for 10,000 y is not enough
3  Superconducting magnetic arms (Lorentz)   F = I L B    -> Sun's field too weak, falls with distance, arms quench,
                                                             and inside the magnetosphere the net force is zero
4  Earth-derived propellant + thrusters       rocket eq.   -> 1e23 kg at 10 km/s gives ~1.45% of required delta-v
"""
import math

GM_SUN, AU, M_E, R_E, C = 1.32712440018e20, 1.495978707e11, 5.972e24, 6.371e6, 2.99792458e8
S0, ALBEDO, YEAR, T_MISSION_Y, A0, A1 = 1361.0, 0.30, 3.15576e7, 10000, 1.0, 2.7
MU0, M_P, T_SURF = 4e-7 * math.pi, 1.67262192e-27, 288.0
T_MISSION = T_MISSION_Y * YEAR


def vcirc(a_au):
    return math.sqrt(GM_SUN / (a_au * AU))


DV_REQ = vcirc(A0) - vcirc(A1)                     # m/s, slow outward spiral
F_REQ = M_E * DV_REQ / T_MISSION                   # N, average push along the orbit for 10,000 years


def a_after_dv(dv, a0=A0):
    """Orbit size after a slow tangential spiral that removed dv of orbital speed (circular orbits)."""
    x = dv / vcirc(a0)
    return a0 / (1 - x) ** 2


def spiral(F_of, years=T_MISSION_Y, n_step=2000, a0=A0):
    """da/dt = 2 a^1.5 F / (M sqrt(GM)) for a tangential force F(a [AU]) [N]; RK4. Returns (a_end, t_reach)."""
    h = years * YEAR / n_step
    f = lambda a: 2 * a ** 1.5 * F_of(a / AU) / (M_E * math.sqrt(GM_SUN))
    a, t_reach = a0 * AU, None
    for i in range(1, n_step + 1):
        k1 = f(a); k2 = f(a + 0.5 * h * k1); k3 = f(a + 0.5 * h * k2); k4 = f(a + h * k3)
        a += h * (k1 + 2 * k2 + 2 * k3 + k4) / 6
        if t_reach is None and a / AU >= A1:
            t_reach = i * h / YEAR
    return a / AU, t_reach


# 1a --------------------------------------------------------------- laser-push heating component
SUN_ABSORBED = S0 * (1 - ALBEDO) * math.pi * R_E ** 2
P_REQ = F_REQ * C
E_ATMOSPHERE = 5.15e18 * 0.5 * 11186 ** 2
E_OCEANS = 1.4e21 * (4186 * (373 - 288) + 2.257e6)
E_CRUST = 2.6e22 * (1000 * (1500 - 288) + 4.0e5)
E_MANTLE = 4.0e24 * (1200 * 1500 + 4.0e5)
E_UNBIND = 2.49e32
P_SAFE = SUN_ABSORBED * (((T_SURF + 2) / T_SURF) ** 4 - 1)


def laser(P):
    if not (math.isfinite(P) and P > 0):
        raise ValueError("laser power must be finite and positive")
    F = P / C
    acc = F / M_E
    dv = acc * T_MISSION
    return dict(P=P, F=F, acc=acc, dv10k=dv, a10k=a_after_dv(min(dv, 0.999 * vcirc(1))), fracOfNeed=F / F_REQ,
                xSunlight=P / SUN_ABSORBED, Tsurf=T_SURF * ((SUN_ABSORBED + P) / SUN_ABSORBED) ** 0.25,
                tAtm=E_ATMOSPHERE / P, tOceans=E_OCEANS / P, tCrust=E_CRUST / P,
                tMantle=E_MANTLE / P, tUnbind=E_UNBIND / P)


# 2 ---------------------------------------------------------------- hydrogen harvesting
N_CM3, V_SW, SUN_MASS_LOSS, EPS_FUSION = 5, 4.0e5, 1.5e9, 0.0071
MASS_FLUX = N_CM3 * 1e6 * M_P * V_SW
VE = C * math.sqrt(2 * EPS_FUSION)
M_NEED = M_E * (math.exp(DV_REQ / VE) - 1)


def hydrogen(R_RE, mdot=None):
    if not (math.isfinite(R_RE) and R_RE >= 0) or (mdot is not None and not (math.isfinite(mdot) and mdot >= 0)):
        raise ValueError("scoop radius and mass flow must be finite and non-negative")
    area = math.pi * (R_RE * R_E) ** 2
    mdot = MASS_FLUX * area if mdot is None else mdot
    m = mdot * T_MISSION
    dv = VE * math.log(1 + m / M_E)
    return dict(R_RE=R_RE, area=area, mdot=mdot, m10k=m, frac=m / M_NEED, dv=dv,
                a10k=a_after_dv(dv), windPush=mdot * V_SW, mNeed=M_NEED)


# 3 ---------------------------------------------------------------- superconducting magnetic arms
BR0, K_SPIRAL = 3.5e-9, 2.7e-6 * AU / 4.0e5
N_ARMS, L_ARM, B_CRIT, A_CABLE, B_EQ = 8, 2 * R_E, 45.0, 1.0, 3.12e-5
L_TOT = N_ARMS * L_ARM


def imf(r_au):
    return BR0 * math.sqrt(1 / r_au ** 4 + (K_SPIRAL / r_au) ** 2)


I_MAX = 2 * math.pi * A_CABLE * B_CRIT / MU0
I_REQ = F_REQ / (L_TOT * imf(1))


def current_to_arrive():
    """Smallest current per arm that reaches 2.7 AU within 10,000 years (best case, quench ignored) - bisection."""
    lo, hi = I_REQ, I_REQ * 100
    for _ in range(40):
        m = math.sqrt(lo * hi)
        if spiral(lambda r: m * L_TOT * imf(r), T_MISSION_Y, 600)[1] is not None:
            hi = m
        else:
            lo = m
    return hi


def magnet(I):
    if not (math.isfinite(I) and I >= 0):
        raise ValueError("magnet current must be finite and non-negative")
    a_end, t_reach = spiral(lambda r: I * L_TOT * imf(r), T_MISSION_Y, 1500)
    F1 = I * L_TOT * imf(1)
    b_mid = B_EQ / (1.25 + 1.0) ** 3
    return dict(I=I, quench=I > I_MAX, F1=F1, fracOfNeed=F1 / F_REQ, aEnd=a_end, tReach=t_reach,
                Fdipole=I * L_ARM * b_mid, Bself=MU0 * I / (2 * math.pi * A_CABLE))


# 4 ---------------------------------------------------------------- Earth-derived reaction mass + thrusters
# Reference budget: 1e23 kg removed from Earth, 10 km/s ideal exhaust, continuous tangential steering for 10,000 y.
M_MOON, THR_VE, THR_MPROP, THR_MMAX, G0 = 7.3458e22, 1.0e4, 1.0e23, 1.0e24, 9.80665


def thruster(m_prop=THR_MPROP, v_e=THR_VE):
    """Ideal rocket-equation screen when propellant is part of Earth's initial mass and is ejected from Earth."""
    if not (math.isfinite(m_prop) and 0 <= m_prop < M_E and math.isfinite(v_e) and v_e > 0):
        raise ValueError("propellant must be 0 <= m_prop < Earth mass and exhaust speed must be positive")
    final_mass = M_E - m_prop
    dv = v_e * math.log(M_E / final_mass)
    a10k = a_after_dv(dv)
    m_need = M_E * (1 - math.exp(-DV_REQ / v_e))
    mdot = m_prop / T_MISSION
    thrust = mdot * v_e
    energy = 0.5 * m_prop * v_e * v_e
    power = energy / T_MISSION
    req_energy = 0.5 * m_need * v_e * v_e
    req_power = req_energy / T_MISSION
    return dict(mProp=m_prop, vE=v_e, finalMass=final_mass, massFraction=m_prop / M_E,
                moonMasses=m_prop / M_MOON, dv=dv, a10k=a10k, deltaKm=(a10k - A0) * AU / 1000,
                dvProgress=dv / DV_REQ, orbitProgress=(a10k - A0) / (A1 - A0), mNeed=m_need,
                needFractionEarth=m_need / M_E, needMultiple=m_need / m_prop if m_prop > 0 else float("inf"),
                mdot=mdot, thrust=thrust, thrustFraction=thrust / F_REQ, energy=energy, power=power,
                reqEnergy=req_energy, reqPower=req_power, powerMultipleSun=power / SUN_ABSORBED,
                reqPowerMultipleSun=req_power / SUN_ABSORBED)


# 1b --------------------------------------------------------------- Dyson-powered beam on the arm-held collector
# Stylized visual-design inputs, not material properties or a structural certification.
ARM_CAP_FRAC, ARM_SF_MIN, ARM_FAIL_STRESS = 0.55, 1.5, 1.55
P_DYSON = 1.29e25
F_DYSON = P_DYSON / C


def summary():
    l, s, h, hm, hw, m, mi = laser(P_REQ), laser(P_SAFE), hydrogen(100), hydrogen(1e4), hydrogen(0, SUN_MASS_LOSS), magnet(I_MAX), magnet(I_REQ)
    return dict(DV_REQ=DV_REQ, F_REQ=F_REQ, P_REQ=P_REQ, P_SAFE=P_SAFE,
                Tsurf_req=l["Tsurf"], tOceans=l["tOceans"], tUnbind=l["tUnbind"], a10k_safe=s["a10k"],
                laser_req_acc=l["acc"], laser_req_dv10k=l["dv10k"], laser_req_a10k=l["a10k"],
                laser_req_xSunlight=l["xSunlight"], laser_req_tAtm=l["tAtm"], laser_req_tCrust=l["tCrust"], laser_req_tMantle=l["tMantle"],
                h100_m=h["m10k"], h_need=M_NEED, h100_frac=h["frac"], h100_mdot=h["mdot"], h100_dv=h["dv"], h100_a=h["a10k"], h100_area=h["area"],
                hmax_m=hm["m10k"], hmax_frac=hm["frac"], hmax_dv=hm["dv"], hmax_a=hm["a10k"],
                hw_m=hw["m10k"], hw_mdot=hw["mdot"], hw_dv=hw["dv"], hw_frac=hw["frac"], hw_a=hw["a10k"],
                I_MAX=I_MAX, I_REQ=I_REQ, A_FOR_IREQ=MU0 * I_REQ / (2 * math.pi * B_CRIT),
                mag_F=m["F1"], mag_a=m["aEnd"], mag_Fdipole=m["Fdipole"], mag_Bself=m["Bself"],
                magreq_a=mi["aEnd"], magreq_t=mi["tReach"], I_ARRIVE=current_to_arrive(), dyson_frac=F_DYSON / F_REQ,
                dyson_T=T_SURF * ((SUN_ABSORBED + P_DYSON) / SUN_ABSORBED) ** 0.25,
                arm_sf_min=ARM_SF_MIN, arm_capacity_power_frac=ARM_CAP_FRAC,
                arm_sf_breach_power_frac=ARM_CAP_FRAC / ARM_SF_MIN,
                arm_cascade_power_frac=ARM_CAP_FRAC * ARM_FAIL_STRESS,
                **{f"thr_{k}": v for k, v in thruster().items()},
                **{f"thr_max_{k}": v for k, v in thruster(THR_MMAX).items()})


def main():
    s = summary()
    km = lambda a: (a - 1) * AU / 1e3
    print(f"Target: 1 -> 2.7 AU in {T_MISSION_Y:,} years: dv {s['DV_REQ']:,.0f} m/s, average push {s['F_REQ']:.3e} N\n")
    print("1 LASER + DYSON ARM-HELD COLLECTOR (radiation pressure)")
    print(f"  beam needed for F_req: {s['P_REQ']:.3e} W = {s['P_REQ'] / 3.828e26:.1%} of the Sun's output; "
          f"global temperature ~{s['Tsurf_req']:,.0f} K, oceans boil in {s['tOceans']:.0f} s, "
          f"Earth unbinds in {s['tUnbind'] / 86400:.1f} days")
    print(f"  Dyson collector beam: {P_DYSON:.3e} W -> {F_DYSON:.3e} N = {s['dyson_frac']:.1%} of F_req; "
          f"Earth ~{s['dyson_T']:,.0f} K; assumed capacity is reached at {s['arm_capacity_power_frac']:.0%} power; "
          f"proxy SF drops below {s['arm_sf_min']:.1f} at {s['arm_sf_breach_power_frac']:.1%}; "
          f"the later {s['arm_cascade_power_frac']:.1%} cascade is illustrative, not a structural prediction -> FAILS\n")
    print("2 HYDROGEN HARVESTING (ideal fusion rocket)")
    print(f"  hydrogen needed {s['h_need']:.3e} kg; a 100 R_E scoop collects {s['h100_m']:.3e} kg in 10,000 y = {s['h100_frac']:.1e} of it")
    print(f"  the ENTIRE solar wind for 10,000 y: {s['hw_frac']:.0%} of the need -> a = {s['hw_a']:.3f} AU -> FAILS\n")
    print("3 SUPERCONDUCTING MAGNETIC ARMS (Lorentz force in the Sun's field)")
    print(f"  current needed per arm {s['I_REQ']:.2e} A; the cable quenches above {s['I_MAX']:.2e} A")
    print(f"  best possible: {s['mag_F']:.2e} N -> Earth moves {km(s['mag_a']) * 1e3:.0f} m in 10,000 y")
    print(f"  even with the impossible current: a = {s['magreq_a']:.2f} AU after 10,000 y (field falls with distance);"
          f" arriving in time needs {s['I_ARRIVE']:.2e} A per arm -> FAILS")
    print("  and in reality the arms are inside the magnetosphere: only Earth's own field acts -> internal forces, net 0\n")
    th = thruster()
    print("4 EARTH-DERIVED THRUSTERS (Earth supplies its own reaction mass)")
    print(f"  chosen budget {th['mProp']:.2e} kg = {100 * th['massFraction']:.2f}% of Earth ({th['moonMasses']:.2f} lunar masses), "
          f"at v_e={th['vE'] / 1000:.1f} km/s (Isp {th['vE'] / G0:.0f} s)")
    print(f"  rocket equation: Δv {th['dv']:.1f} of {DV_REQ:,.0f} m/s = {100 * th['dvProgress']:.2f}%; "
          f"a = {th['a10k']:.5f} AU after 10,000 y (target 2.7 AU)")
    print(f"  required at the same v_e: {th['mNeed']:.2e} kg = {100 * th['needFractionEarth']:.1f}% of initial Earth mass "
          f"({th['needMultiple']:.1f}x the chosen budget); ideal exhaust energy {th['reqEnergy']:.2e} J "
          f"({th['reqPower']:.2e} W average) -> FAILS")
    mx = thruster(THR_MMAX)
    print(f"  even the tested {THR_MMAX:.0e} kg ceiling reaches only {mx['dv']:.0f} m/s and a={mx['a10k']:.5f} AU\n")


if __name__ == "__main__":
    main()
