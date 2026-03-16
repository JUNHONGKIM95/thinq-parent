import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const STORE_PATH = path.resolve(__dirname, '../data/store.json')

export async function readStore() {
  const raw = await fs.readFile(STORE_PATH, 'utf8')
  return JSON.parse(raw)
}

export async function writeStore(store) {
  await fs.writeFile(STORE_PATH, `${JSON.stringify(store, null, 2)}\n`, 'utf8')
}

export async function updateStore(updater) {
  const store = await readStore()
  const nextStore = await updater(store)
  await writeStore(nextStore)
  return nextStore
}
