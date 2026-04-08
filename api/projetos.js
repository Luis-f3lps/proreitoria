import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  // --- LISTAR PROJETOS ---
  if (req.method === 'GET') {
    try {
      const projetos = await sql`SELECT * FROM projetos ORDER BY id DESC`;
      return res.status(200).json(projetos);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar projetos" });
    }
  }

  // --- ADICIONAR PROJETO ---
  if (req.method === 'POST') {
    try {
      const { titulo, area, unidade, coordenador, tipo, vigencia_inicio, processo_sei } = req.body;
      
      const dataValida = vigencia_inicio ? vigencia_inicio : null;

      await sql`
        INSERT INTO projetos (titulo, area, unidade, coordenador, tipo, vigencia_inicio, processo_sei)
        VALUES (${titulo}, ${area}, ${unidade}, ${coordenador}, ${tipo}, ${dataValida}, ${processo_sei})
      `;
      
      return res.status(201).json({ message: "Projeto salvo com sucesso!" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao salvar no banco." });
    }
  }

  // --- APAGAR PROJETO ---
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body; // Pega o ID enviado pelo front-end
      await sql`DELETE FROM projetos WHERE id = ${id}`;
      return res.status(200).json({ message: "Projeto apagado!" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao apagar do banco." });
    }
  }
}