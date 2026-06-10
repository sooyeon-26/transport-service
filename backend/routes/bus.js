import { Router } from 'express';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MODEL_DIR = path.resolve(__dirname, '../model');
const DEFAULT_PYTHON = path.resolve(__dirname, '../venv/bin/python');
const PYTHON_BIN = process.env.PYTHON_BIN || DEFAULT_PYTHON;

function runPython(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_BIN, args, { cwd: MODEL_DIR });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `Python exited with code ${code}`));
        return;
      }

      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(new Error(`Invalid Python JSON: ${error.message}`));
      }
    });
  });
}

router.get('/predict', async (req, res) => {
  const { route, station, hour, dayType = 'weekday' } = req.query;

  if (!route || !station || hour === undefined) {
    res.status(400).json({ error: 'route, station, hour는 필수입니다.' });
    return;
  }

  try {
    const result = await runPython([
      'predict.py',
      '--mode',
      'predict',
      '--route',
      String(route),
      '--station',
      String(station),
      '--hour',
      String(hour),
      '--dayType',
      String(dayType)
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/hourly', async (req, res) => {
  const { route, station, dayType = 'weekday' } = req.query;

  if (!route || !station) {
    res.status(400).json({ error: 'route, station은 필수입니다.' });
    return;
  }

  try {
    const result = await runPython([
      'predict.py',
      '--mode',
      'hourly',
      '--route',
      String(route),
      '--station',
      String(station),
      '--dayType',
      String(dayType)
    ]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/options', async (_req, res) => {
  try {
    const result = await runPython(['predict.py', '--mode', 'options']);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
