import { type NextRequest, NextResponse } from "next/server"
import { readFile, realpath } from "node:fs/promises"
import { resolve, relative, isAbsolute, sep } from "node:path"

const ROOT = resolve(process.cwd(), "public", "registry")

function isWithin(root: string, candidate: string): boolean {
  const rel = relative(root, candidate)
  return rel !== "" && rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel)
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params
  if (!Array.isArray(path) || path.length === 0 ||
    path.some((part) => !part || part === "." || part === ".." ||
      part.includes("/") || part.includes("\\") || part.includes("\0") ||
      part.includes("%") || part.includes(":"))) {
    return NextResponse.json({ error: "Invalid registry path" }, { status: 400 })
  }

  const candidate = resolve(ROOT, ...path)
  if (!isWithin(ROOT, candidate) || !candidate.endsWith(".json")) {
    return NextResponse.json({ error: "Invalid registry path" }, { status: 400 })
  }

  try {
    const [rootReal, candidateReal] = await Promise.all([realpath(ROOT), realpath(candidate)])
    if (!isWithin(rootReal, candidateReal) || !candidateReal.endsWith(".json")) {
      return NextResponse.json({ error: "Invalid registry path" }, { status: 400 })
    }
    const content = await readFile(candidateReal, "utf-8")
    return NextResponse.json(JSON.parse(content), {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch {
    return NextResponse.json({ error: "Component not found" }, { status: 404 })
  }
}
