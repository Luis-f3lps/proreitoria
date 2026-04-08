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
      // 1. Pegando TODAS as colunas que o seu admin.js vai enviar
      const { 
        titulo, area, unidade, coordenador, email, tipo, 
        formacao, carreira, vigencia_inicio, vigencia_termino, 
        processo_sei, etica_seguranca 
      } = req.body;
      
      // 2. Tratando as datas (se o usuário não preencher no HTML, manda NULL pro banco)
      const dataInicio = vigencia_inicio ? vigencia_inicio : null;
      const dataTermino = vigencia_termino ? vigencia_termino : null;

      // 3. Inserindo com as 12 colunas
      await sql`
        INSERT INTO projetos (
          titulo, area, unidade, coordenador, email, tipo, 
          formacao, carreira, vigencia_inicio, vigencia_termino, 
          processo_sei, etica_seguranca
        )
        VALUES (
          ${titulo}, ${area}, ${unidade}, ${coordenador}, ${email}, ${tipo}, 
          ${formacao}, ${carreira}, ${dataInicio}, ${dataTermino}, 
          ${processo_sei}, ${etica_seguranca}
        )
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
      const { id } = req.body; 
      await sql`DELETE FROM projetos WHERE id = ${id}`;
      return res.status(200).json({ message: "Projeto apagado!" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao apagar do banco." });
    }
  }
}