
// Este arquivo contém informações sobre as políticas de RLS configuradas no banco de dados
// Serve apenas para documentação e referência

/*
 * Políticas para a tabela "profiles"
 * - Usuários autenticados podem ver todos os perfis (para funcionalidades de sistema)
 * - Usuários só podem atualizar seu próprio perfil
 * - Admins podem gerenciar todos os perfis
 */

/*
 * Políticas para a tabela "assisted_persons"
 * - Todos os usuários autenticados podem ver e editar pessoas assistidas
 * - Isso permite busca e reuso de registros entre departamentos
 */

/*
 * Políticas para a tabela "assistance_cases"
 * - Usuários podem ver todos os casos para permitir análise cruzada
 * - Usuários só podem editar casos que eles registraram (exceto admin e assistencia_social)
 */

/*
 * Políticas para a tabela "social_followups"
 * - Apenas usuários de assistência social e admin podem criar followups
 * - Todos os usuários autenticados podem ver followups (para transparência)
 */

/*
 * Políticas para a tabela "alerts"
 * - Todos os usuários autenticados podem ver alertas
 * - Apenas usuários de assistência social e admin podem marcar alertas como resolvidos
 */

// Este arquivo é apenas para documentação e não tem funcionalidade de código
