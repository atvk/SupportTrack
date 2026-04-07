import fs from 'fs/promises';
import path from 'path';
import { Evaluation } from './types';

const DATA_FILE = path.join(process.cwd(), 'data', 'evaluations.json');

export async function getEvaluations(): Promise<Evaluation[]> {
  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function saveEvaluation(evaluation: Evaluation): Promise<Evaluation> {
  const evaluations = await getEvaluations();
  const newEvaluation = {
    ...evaluation,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  evaluations.push(newEvaluation);
  await fs.writeFile(DATA_FILE, JSON.stringify(evaluations, null, 2));
  return newEvaluation;
}