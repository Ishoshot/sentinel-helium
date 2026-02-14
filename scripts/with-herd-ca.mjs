import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const command = process.argv[2]
const args = process.argv.slice(3)

if (!command) {
  process.stderr.write('[Sentinel] Missing command for with-herd-ca script.\n')
  process.exit(1)
}

const caCandidates = [
  join(homedir(), 'Library/Application Support/Herd/config/valet/CA/LaravelValetCASelfSigned.pem'),
  join(homedir(), '.config/valet/CA/LaravelValetCASelfSigned.pem'),
]

const discoveredCaPath = caCandidates.find(existsSync)
const env = { ...process.env }

if (!env.NODE_EXTRA_CA_CERTS && discoveredCaPath) {
  env.NODE_EXTRA_CA_CERTS = discoveredCaPath
}

const child = spawn(command, args, {
  stdio: 'inherit',
  env,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})

child.on('error', (error) => {
  process.stderr.write(`[Sentinel] Failed to start command with Herd CA. ${String(error)}\n`)
  process.exit(1)
})
