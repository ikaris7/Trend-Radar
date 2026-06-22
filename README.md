# TrendRadar IA — versão Vercel

## O que enviar ao GitHub
Envie todos os arquivos e pastas deste projeto, mantendo `api/news.js` dentro da pasta `api`.

## Publicação
1. Crie uma conta em NewsData.io e copie sua API Key.
2. Na Vercel, importe este repositório do GitHub.
3. Em Settings > Environment Variables, crie:
   - Nome: `NEWSDATA_API_KEY`
   - Valor: sua chave da NewsData.io
4. Faça o Deploy ou Redeploy.
5. Teste: `https://SEU-PROJETO.vercel.app/api/news?q=OpenAI`

A chave não deve ser colocada em nenhum arquivo do projeto.
