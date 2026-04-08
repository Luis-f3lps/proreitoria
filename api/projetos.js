import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    try {
      const projetos = await sql`SELECT * FROM projetos`;
      return res.status(200).json(projetos);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar projetos" });
    }
  }
}