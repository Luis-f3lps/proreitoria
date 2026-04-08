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

  // --- ADICIONAR PROJETO(S) ---
  if (req.method === 'POST') {
    try {
      const dados = req.body;

      // SE FOR UM ARRAY (Vindo da importação do CSV)
      if (Array.isArray(dados)) {
        for (const p of dados) {
          const inicio = p.vigencia_inicio ? p.vigencia_inicio : null;
          const termino = p.vigencia_termino ? p.vigencia_termino : null;

          await sql`
            INSERT INTO projetos (
              titulo, area, unidade, coordenador, email, tipo, 
              formacao, carreira, vigencia_inicio, vigencia_termino, 
              processo_sei, etica_seguranca
            )
            VALUES (
              ${p.titulo}, ${p.area}, ${p.unidade}, ${p.coordenador}, ${p.email}, ${p.tipo}, 
              ${p.formacao}, ${p.carreira}, ${inicio}, ${termino}, 
              ${p.processo_sei}, ${p.etica_seguranca}
            )
          `;
        }
        return res.status(201).json({ message: `${dados.length} projetos importados com sucesso!` });
      } 
      
      // SE FOR UM OBJETO ÚNICO (Vindo do formulário manual de adicionar 1 só)
      else {
        const { titulo, area, unidade, coordenador, email, tipo, formacao, carreira, vigencia_inicio, vigencia_termino, processo_sei, etica_seguranca } = dados;
        const inicio = vigencia_inicio ? vigencia_inicio : null;
        const termino = vigencia_termino ? vigencia_termino : null;

        await sql`
          INSERT INTO projetos (titulo, area, unidade, coordenador, email, tipo, formacao, carreira, vigencia_inicio, vigencia_termino, processo_sei, etica_seguranca)
          VALUES (${titulo}, ${area}, ${unidade}, ${coordenador}, ${email}, ${tipo}, ${formacao}, ${carreira}, ${inicio}, ${termino}, ${processo_sei}, ${etica_seguranca})
        `;
        return res.status(201).json({ message: "Projeto salvo com sucesso!" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Erro ao salvar no banco." });
    }
  }

  // --- APAGAR PROJETO ---
  if (req.method === 'DELETE') {
    try {
      const { id } = req.body; 
      await sql`DELETE FROM projetos WHERE id = ${id}`;
      return res.status(200).json({ message: "Projeto apagado!" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao apagar do banco." });
    }
  }
}