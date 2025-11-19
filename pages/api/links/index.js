import prisma from "../../../lib/prisma";
import validator from "validator";

const CODE_REGEX = /^[A-Za-z0-9]{6,8}$/;

export default async function handler(req, res) {
  if (req.method === "POST") {
    const { target, code } = req.body || {};

    if (!target) return res.status(400).json({ error: "target is required" });

    const normalized = target.match(/^https?:\/\//)
      ? target
      : `https://${target}`;

    if (!validator.isURL(normalized, { require_protocol: true })) {
      return res.status(400).json({ error: "invalid URL" });
    }

    let finalCode = code;

    if (finalCode) {
      if (!CODE_REGEX.test(finalCode)) {
        return res.status(400).json({ error: "code must match [A-Za-z0-9]{6,8}" });
      }
      const exists = await prisma.link.findUnique({ where: { code: finalCode } });
      if (exists) return res.status(409).json({ error: "code already exists" });
    } else {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const gen = () => Array.from({ length: 6 }).map(() => chars[Math.floor(Math.random() * chars.length)]).join("");

      let attempt = 0;
      do {
        finalCode = gen();
        attempt++;
        if (attempt > 10) return res.status(500).json({ error: "could not generate unique code" });
      } while (await prisma.link.findUnique({ where: { code: finalCode } }));
    }

    const created = await prisma.link.create({
      data: { code: finalCode, target: normalized }
    });

    return res.status(201).json(created);
  }

  if (req.method === "GET") {
    const links = await prisma.link.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json(links);
  }

  res.setHeader("Allow", "GET,POST");
  return res.status(405).end();
}
