import math
import random
import json
from pathlib import Path
from datetime import datetime, timezone

from django.http import HttpResponse
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response


_NOTEBOOK_FISION_HTML = None
_NOTEBOOK_PRINCIPAL_HTML = None


def _extract_html_fision_from_notebook():
	global _NOTEBOOK_FISION_HTML
	if _NOTEBOOK_FISION_HTML is not None:
		return _NOTEBOOK_FISION_HTML
	html = _extract_html_from_notebook_variable("HTML_FISION")
	if html:
		_NOTEBOOK_FISION_HTML = html
	return _NOTEBOOK_FISION_HTML


def _extract_html_principal_from_notebook():
	global _NOTEBOOK_PRINCIPAL_HTML
	if _NOTEBOOK_PRINCIPAL_HTML is not None:
		return _NOTEBOOK_PRINCIPAL_HTML
	html = _extract_html_from_notebook_variable("HTML_PRINCIPAL")
	if html:
		_NOTEBOOK_PRINCIPAL_HTML = html
	return _NOTEBOOK_PRINCIPAL_HTML


def _extract_html_from_notebook_variable(variable_name):

	notebook_path = Path(__file__).resolve().parents[2] / "tesis_lab_nuclear.ipynb"
	if not notebook_path.exists():
		return None

	try:
		payload = json.loads(notebook_path.read_text(encoding="utf-8"))
	except (OSError, json.JSONDecodeError):
		return None

	for cell in payload.get("cells", []):
		if cell.get("cell_type") != "code":
			continue
		source = "".join(cell.get("source", []))
		marker_index = source.find(variable_name)
		if marker_index < 0:
			continue

		triple_start = source.find('"""', marker_index)
		if triple_start < 0:
			continue
		triple_end = source.find('"""', triple_start + 3)
		if triple_end < 0:
			continue

		return source[triple_start + 3:triple_end]

	return None


def _normalize_notebook_navigation(html):
	if not html:
		return html

	# Force fission navigation to stay in the same browser view when embedded by Vite.
	replacements = {
		"window.open('/fision', '_blank');": "window.location.href='/django/api/fision/';",
		"window.open(\"/fision\", \"_blank\");": "window.location.href='/django/api/fision/';",
		"window.open('fision_nuclear.html', '_blank');": "window.location.href='/django/api/fision/';",
		"window.open(\"fision_nuclear.html\", \"_blank\");": "window.location.href='/django/api/fision/';",
	}

	for old, new in replacements.items():
		html = html.replace(old, new)

	# Keep the "Volver" link in the same embedded flow.
	html = html.replace('href="/"', 'href="/django/api/principal/"')

	return html


def _to_float(value, field_name):
	try:
		return float(value)
	except (TypeError, ValueError):
		raise ValueError(f"El campo '{field_name}' debe ser numerico")


def _to_int(value, field_name):
	try:
		return int(value)
	except (TypeError, ValueError):
		raise ValueError(f"El campo '{field_name}' debe ser entero")


def energia_final_formula(energy, mass_number, angle_deg):
	theta_rad = math.radians(angle_deg)
	return energy * (
		(mass_number * mass_number + 1 + 2 * mass_number * math.cos(theta_rad))
		/ ((mass_number + 1) ** 2)
	)


def monte_carlo_formula(probability, initial_neutrons, steps=50, seed=None):
	rng = random.Random(seed)
	neutrons = [initial_neutrons]
	for _ in range(steps):
		nuevos = sum(
			rng.randint(0, 2) if rng.random() < probability else 0
			for _ in range(neutrons[-1])
		)
		neutrons.append(nuevos)
	return neutrons


def _poisson(lam, rng):
	# Knuth algorithm, stable for small lambda values used in this app.
	threshold = math.exp(-lam)
	k = 0
	prod = 1.0
	while prod > threshold:
		k += 1
		prod *= rng.random()
	return k - 1


FISION_HTML = """<!DOCTYPE html>
<html lang="es">
<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Simulacion de Fision Nuclear</title>
	<style>
		:root {
			--bg: #08111c;
			--panel: #101f33;
			--text: #dbeafe;
			--accent: #22d3ee;
			--warn: #fb7185;
			--ok: #4ade80;
		}
		* { box-sizing: border-box; }
		body {
			margin: 0;
			font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
			background: radial-gradient(circle at 20% 10%, #112945, var(--bg));
			color: var(--text);
			min-height: 100vh;
			display: grid;
			grid-template-rows: auto 1fr;
		}
		.toolbar {
			display: flex;
			gap: 12px;
			align-items: center;
			padding: 14px;
			background: #0a1627cc;
			border-bottom: 1px solid #1f3653;
			backdrop-filter: blur(8px);
			position: sticky;
			top: 0;
			z-index: 20;
		}
		.toolbar h1 {
			margin: 0;
			font-size: 18px;
			margin-right: auto;
		}
		.btn {
			border: 1px solid #2b4768;
			background: var(--panel);
			color: var(--text);
			padding: 8px 12px;
			border-radius: 8px;
			cursor: pointer;
		}
		.btn:hover { border-color: var(--accent); }
		.stage {
			display: grid;
			place-items: center;
			padding: 16px;
		}
		canvas {
			width: min(96vw, 920px);
			height: min(74vh, 600px);
			border: 1px solid #2b4768;
			border-radius: 14px;
			background: radial-gradient(circle at center, #0d2035 0%, #07101b 75%);
			box-shadow: 0 30px 70px rgba(0, 0, 0, 0.45);
		}
		.legend {
			font-size: 12px;
			opacity: 0.9;
		}
		.dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
	</style>
</head>
<body>
	<div class="toolbar">
		<h1>Simulacion de Fision Nuclear</h1>
		<button class="btn" id="startBtn">Iniciar fision</button>
		<button class="btn" id="resetBtn">Reiniciar</button>
		<span id="status" class="legend">Estado: en espera</span>
		<span class="legend"><span class="dot" style="background:#22d3ee"></span>Neutron</span>
		<span class="legend"><span class="dot" style="background:#facc15"></span>Nucleo</span>
		<span class="legend"><span class="dot" style="background:#fb7185"></span>Fragmentos</span>
	</div>

	<div class="stage">
		<canvas id="sim" width="920" height="600"></canvas>
	</div>

	<script>
		const canvas = document.getElementById('sim');
		const ctx = canvas.getContext('2d');
		const statusEl = document.getElementById('status');
		const startBtn = document.getElementById('startBtn');
		const resetBtn = document.getElementById('resetBtn');

		const nucleus = { x: canvas.width / 2, y: canvas.height / 2, r: 44, split: false, pulse: 0 };
		let neutron = { x: 70, y: canvas.height / 2, vx: 3.2, vy: 0, r: 8, active: false };
		let fragments = [];
		let particles = [];
		let running = true;
		let frame = 0;

		function setStatus(text) { statusEl.textContent = `Estado: ${text}`; }

		function resetSim() {
			neutron = { x: 70, y: canvas.height / 2, vx: 3.2, vy: 0, r: 8, active: false };
			fragments = [];
			particles = [];
			nucleus.split = false;
			setStatus('en espera');
		}

		function startFission() {
			if (nucleus.split) return;
			neutron.active = true;
			setStatus('neutron en trayectoria');
		}

		function emitParticles() {
			for (let i = 0; i < 36; i++) {
				const a = (Math.PI * 2 * i) / 36;
				const speed = 1 + Math.random() * 3;
				particles.push({
					x: nucleus.x,
					y: nucleus.y,
					vx: Math.cos(a) * speed,
					vy: Math.sin(a) * speed,
					life: 80 + Math.random() * 40,
					r: 2 + Math.random() * 2,
				});
			}
		}

		function triggerSplit() {
			nucleus.split = true;
			neutron.active = false;
			fragments = [
				{ x: nucleus.x - 22, y: nucleus.y, vx: -1.8, vy: -0.6, r: 26 },
				{ x: nucleus.x + 22, y: nucleus.y, vx: 1.8, vy: 0.6, r: 25 },
			];
			emitParticles();
			setStatus('fision en progreso');
		}

		function update() {
			frame += 1;
			nucleus.pulse = 1 + Math.sin(frame * 0.08) * 0.06;

			if (neutron.active && !nucleus.split) {
				neutron.x += neutron.vx;
				neutron.y += neutron.vy;
				const dx = neutron.x - nucleus.x;
				const dy = neutron.y - nucleus.y;
				const d = Math.sqrt(dx * dx + dy * dy);
				if (d <= nucleus.r + neutron.r) {
					triggerSplit();
				}
			}

			fragments.forEach((f) => {
				f.x += f.vx;
				f.y += f.vy;
				f.vx *= 0.995;
				f.vy *= 0.995;
			});

			particles.forEach((p) => {
				p.x += p.vx;
				p.y += p.vy;
				p.vx *= 0.99;
				p.vy *= 0.99;
				p.life -= 1;
			});
			particles = particles.filter((p) => p.life > 0);

			if (nucleus.split && particles.length === 0) {
				setStatus('fision completada');
			}
		}

		function drawBackground() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			for (let i = 0; i < 120; i++) {
				const x = (i * 173) % canvas.width;
				const y = (i * 97 + frame * 0.3) % canvas.height;
				ctx.fillStyle = 'rgba(170, 220, 255, 0.2)';
				ctx.fillRect(x, y, 1.2, 1.2);
			}
		}

		function drawNucleus() {
			if (nucleus.split) return;
			ctx.beginPath();
			ctx.fillStyle = '#facc15';
			ctx.arc(nucleus.x, nucleus.y, nucleus.r * nucleus.pulse, 0, Math.PI * 2);
			ctx.fill();
		}

		function drawNeutron() {
			if (!neutron.active && !nucleus.split) return;
			ctx.beginPath();
			ctx.fillStyle = '#22d3ee';
			ctx.arc(neutron.x, neutron.y, neutron.r, 0, Math.PI * 2);
			ctx.fill();
		}

		function drawFragments() {
			fragments.forEach((f) => {
				ctx.beginPath();
				ctx.fillStyle = '#fb7185';
				ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
				ctx.fill();
			});
		}

		function drawParticles() {
			particles.forEach((p) => {
				ctx.beginPath();
				ctx.fillStyle = `rgba(255, 181, 167, ${Math.max(0.1, p.life / 120)})`;
				ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
				ctx.fill();
			});
		}

		function loop() {
			if (running) {
				update();
				drawBackground();
				drawNucleus();
				drawNeutron();
				drawFragments();
				drawParticles();
			}
			requestAnimationFrame(loop);
		}

		startBtn.addEventListener('click', startFission);
		resetBtn.addEventListener('click', resetSim);
		loop();
	</script>
</body>
</html>
"""


def fision_simulation_page(request):
	html_from_notebook = _extract_html_fision_from_notebook()
	if html_from_notebook:
		return HttpResponse(_normalize_notebook_navigation(html_from_notebook))
	return HttpResponse(FISION_HTML)


def principal_page(request):
	html_from_notebook = _extract_html_principal_from_notebook()
	if html_from_notebook:
		return HttpResponse(_normalize_notebook_navigation(html_from_notebook))
	return HttpResponse(
		"<h1>No se encontro HTML_PRINCIPAL en el notebook</h1>",
		status=404,
	)


@api_view(["GET"])
def health_check(request):
	return Response(
		{
			"message": "Backend Django funcionando",
			"status": "ok",
		}
	)


@api_view(["POST"])
def energia_final(request):
	try:
		energy = _to_float(request.data.get("E"), "E")
		mass_number = _to_float(request.data.get("A"), "A")
		angle_deg = _to_float(request.data.get("theta"), "theta")
		result = energia_final_formula(energy, mass_number, angle_deg)
	except ValueError as error:
		return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)

	return Response(
		{
			"inputs": {"E": energy, "A": mass_number, "theta": angle_deg},
			"result": result,
		}
	)


@api_view(["POST"])
def monte_carlo(request):
	try:
		probability = _to_float(request.data.get("p"), "p")
		initial_neutrons = _to_int(request.data.get("n0"), "n0")
		steps = _to_int(request.data.get("pasos", 50), "pasos")
		seed_raw = request.data.get("seed", None)
		seed = None if seed_raw in (None, "") else _to_int(seed_raw, "seed")

		if probability < 0 or probability > 1:
			raise ValueError("El campo 'p' debe estar entre 0 y 1")
		if initial_neutrons < 0:
			raise ValueError("El campo 'n0' no puede ser negativo")
		if steps < 1 or steps > 500:
			raise ValueError("El campo 'pasos' debe estar entre 1 y 500")

		series = monte_carlo_formula(probability, initial_neutrons, steps, seed)
	except ValueError as error:
		return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)

	return Response(
		{
			"inputs": {"p": probability, "n0": initial_neutrons, "pasos": steps, "seed": seed},
			"series": series,
			"summary": {
				"final": series[-1],
				"max": max(series),
				"min": min(series),
				"length": len(series),
			},
		}
	)


@api_view(["POST"])
def monte_carlo_fission(request):
	try:
		initial_neutrons = _to_int(request.data.get("initial_neutrons"), "initial_neutrons")
		generations = _to_int(request.data.get("generations"), "generations")
		fission_probability = _to_float(request.data.get("fission_probability"), "fission_probability")
		neutrons_per_fission = _to_float(request.data.get("neutrons_per_fission", 2.43), "neutrons_per_fission")

		if initial_neutrons <= 0 or initial_neutrons > 10000:
			raise ValueError("initial_neutrons debe estar entre 1 y 10000")
		if generations <= 0 or generations > 100:
			raise ValueError("generations debe estar entre 1 y 100")
		if fission_probability < 0 or fission_probability > 1:
			raise ValueError("fission_probability debe estar entre 0 y 1")
		if neutrons_per_fission < 1 or neutrons_per_fission > 5:
			raise ValueError("neutrons_per_fission debe estar entre 1 y 5")
	except ValueError as error:
		return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)

	rng = random.Random()
	population = initial_neutrons
	gen = [0]
	pops = [population]
	fissions_per_gen = [0]
	k_effective = [0.0]
	total_fissions = 0

	for g in range(1, generations + 1):
		if population <= 0:
			gen.append(g)
			pops.append(0)
			fissions_per_gen.append(0)
			k_effective.append(0.0)
			continue

		sampled = min(population, 50000)
		scale = population / sampled
		fissions = 0
		for _ in range(sampled):
			if rng.random() < fission_probability:
				fissions += 1
		fissions = int(fissions * scale)

		new_neutrons = 0
		poisson_sampled = min(fissions, 50000)
		for _ in range(poisson_sampled):
			new_neutrons += _poisson(neutrons_per_fission, rng)
		if fissions > 50000 and poisson_sampled > 0:
			new_neutrons = int(new_neutrons * (fissions / poisson_sampled))

		k = (new_neutrons / population) if population > 0 else 0.0
		population = min(new_neutrons, 1_000_000_000)
		total_fissions += fissions

		gen.append(g)
		pops.append(population)
		fissions_per_gen.append(fissions)
		k_effective.append(k)

	avg_k = sum(k_effective[1:]) / max(1, len(k_effective) - 1)
	if avg_k < 0.98:
		regime = "subcritical"
	elif avg_k <= 1.02:
		regime = "critical"
	else:
		regime = "supercritical"

	return Response(
		{
			"id": str(random.randint(100000, 999999)),
			"generations": gen,
			"population": pops,
			"fissions": fissions_per_gen,
			"k_effective": [round(x, 6) for x in k_effective],
			"total_fissions": total_fissions,
			"final_population": population,
			"average_k": round(avg_k, 4),
			"regime": regime,
			"timestamp": datetime.now(timezone.utc).isoformat(),
		}
	)


@api_view(["POST"])
def scattering_elastic(request):
	try:
		initial_energy = _to_float(request.data.get("initial_energy"), "initial_energy")
		nucleus_mass = _to_float(request.data.get("nucleus_mass"), "nucleus_mass")
		num_points = _to_int(request.data.get("num_points", 180), "num_points")

		if initial_energy <= 0 or initial_energy > 20:
			raise ValueError("initial_energy debe estar entre 0 y 20")
		if nucleus_mass < 1 or nucleus_mass > 250:
			raise ValueError("nucleus_mass debe estar entre 1 y 250")
		if num_points < 10 or num_points > 360:
			raise ValueError("num_points debe estar entre 10 y 360")
	except ValueError as error:
		return Response({"error": str(error)}, status=status.HTTP_400_BAD_REQUEST)

	alpha = ((nucleus_mass - 1.0) / (nucleus_mass + 1.0)) ** 2
	angles = [i * (180.0 / (num_points - 1)) for i in range(num_points)]
	energy_after = []
	for deg in angles:
		theta = math.radians(deg)
		ratio = 0.5 * (1.0 + alpha + (1.0 - alpha) * math.cos(theta))
		energy_after.append(round(initial_energy * ratio, 6))

	e_min = 0.001
	e_max = max(initial_energy * 1.5, 1.0)
	energies_grid = [e_min + (e_max - e_min) * i / (num_points - 1) for i in range(num_points)]
	sigma_0 = 4.0
	e_res = 0.5 + (nucleus_mass / 100.0)
	gamma = 0.15
	cross_section = []
	for energy in energies_grid:
		base = sigma_0 / math.sqrt(energy)
		resonance = 8.0 * (gamma**2) / ((energy - e_res) ** 2 + gamma**2)
		cross_section.append(round(base + resonance, 4))

	return Response(
		{
			"id": str(random.randint(100000, 999999)),
			"angles_deg": [round(a, 2) for a in angles],
			"energy_after": energy_after,
			"energies_grid": [round(e, 4) for e in energies_grid],
			"cross_section": cross_section,
			"alpha": round(alpha, 6),
			"min_energy": round(initial_energy * alpha, 6),
			"max_energy_loss_fraction": round(1.0 - alpha, 6),
			"timestamp": datetime.now(timezone.utc).isoformat(),
		}
	)
