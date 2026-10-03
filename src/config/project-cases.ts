// project-cases.ts
// Texto do case de um projeto (hoje só o Data Center Cotia), pra exibir
// no botão "Sobre o projeto" dentro da galeria de Projetos — mantém a
// grade de fotos sem nenhum texto por cima, como já era, mas deixa o
// case completo disponível sob demanda.

export interface ProjectCaseResult {
  title: string
  description: string
}

export interface ProjectCase {
  title: string
  tagline: string
  intro: string[]
  challengeTitle: string
  challenge: string[]
  solutionTitle: string
  solutionIntro: string
  solutionSpecs: string[]
  tieBreakerNote: string
  continuityTitle: string
  continuity: string[]
  resultsTitle: string
  resultsIntro: string
  results: ProjectCaseResult[]
  closingTitle: string
  closing: string[]
}

export const DATA_CENTER_CASE: ProjectCase = {
  title: 'Data Center Cotia: 12 MVA de energia crítica para uma operação de alta disponibilidade',
  tagline: 'Energia crítica exige mais do que capacidade. Exige confiabilidade.',
  intro: [
    'Em um Data Center Tier III, a infraestrutura de energia precisa estar preparada para operar com alto nível de disponibilidade, redundância e segurança. Afinal, uma eventual indisponibilidade no fornecimento de energia pode comprometer diretamente a continuidade de operações críticas.',
    'Foi nesse contexto que a Essencial Energia participou de um projeto de grande complexidade em Cotia, na Grande São Paulo, com o desafio de implementar uma infraestrutura de geração capaz de atender uma demanda de aproximadamente 12 MVA, com uma arquitetura redundante e preparada para diferentes cenários de operação, manutenção e eventual indisponibilidade.',
    'Mais do que fornecer grupos geradores, o projeto exigia uma solução completa, envolvendo engenharia, fornecimento, instalação, comissionamento e suporte à continuidade da operação durante a implantação.',
  ],
  challengeTitle: 'O desafio: garantir energia para uma operação crítica',
  challenge: [
    'Para uma infraestrutura de missão crítica, a geração de energia precisa ser dimensionada considerando não apenas a capacidade instalada, mas também a forma como os equipamentos são distribuídos e como a operação pode responder a situações de falha ou manutenção.',
    'No projeto de Cotia, a solução foi estruturada em quatro blocos independentes, cada um composto por dois grupos geradores.',
    'Essa configuração permitiu estabelecer uma arquitetura de redundância N+1 distribuída, na qual, em cada bloco, um dos grupos geradores é capaz de atender 100% da carga correspondente ao bloco em caso de falha ou manutenção do outro equipamento.',
    'Os blocos possuem sistemas de Tie Breaker e operam de forma independente. Não existe uma interligação entre os oito grupos geradores que permita configurar o sistema como 2N ou utilizar os equipamentos de diferentes blocos para atender conjuntamente a carga total da instalação.',
  ],
  solutionTitle: 'A solução entregue pela Essencial Energia',
  solutionIntro:
    'A Essencial Energia foi responsável pela execução turnkey do projeto, contemplando o fornecimento, a instalação e o comissionamento da solução de geração de energia. Para atender à operação do Data Center, foram instalados:',
  solutionSpecs: [
    '8 grupos geradores de 1.560 kVA, totalizando aproximadamente 12 MVA de capacidade instalada',
    'Geradores PowerBox, instalados em containers de 20 pés e importados do Reino Unido',
    'Motores Cummins, com equipamentos da fabricante britânica Dale Power',
    'Arquitetura de redundância N+1 distribuída em 4 blocos independentes',
    '4 tanques de combustível de 30.000 litros, totalizando 120.000 litros de capacidade de armazenamento',
    '8 sistemas de transferência em rampa, associados aos respectivos blocos de geração',
    'Sistemas de Tie Breaker integrados aos painéis',
  ],
  tieBreakerNote:
    'Em cada um dos quatro blocos, os dois grupos geradores de 1.560 kVA são interligados por um sistema de Tie Breaker. Essa configuração permite que um único grupo assuma 100% da carga daquele bloco em caso de falha ou manutenção do outro, além de possibilitar o paralelismo para divisão de carga em situações de maior demanda.',
  continuityTitle: 'Continuidade também durante a implantação',
  continuity: [
    'Em projetos de infraestrutura crítica, a segurança da operação não termina na entrega da solução definitiva. O período de implantação também exige planejamento para evitar que as atividades da obra criem riscos adicionais à continuidade operacional.',
    'Por isso, além da infraestrutura definitiva, a Essencial Energia disponibilizou 3 grupos geradores de 1.560 kVA em locação durante a obra.',
    'Os equipamentos criaram uma camada adicional de proteção para o Data Center durante o período de execução, contribuindo para a continuidade da operação diante de eventuais falhas durante a implantação.',
    'Dessa forma, a atuação da Essencial não se limitou ao fornecimento da infraestrutura definitiva. A empresa também participou da estratégia de proteção da operação durante a transição e a implantação do projeto.',
  ],
  resultsTitle: 'Os resultados do projeto',
  resultsIntro:
    'O projeto entregou ao Data Center uma infraestrutura de geração de aproximadamente 12 MVA, estruturada para uma operação crítica e com redundância distribuída em quatro blocos independentes.',
  results: [
    {
      title: 'Alta capacidade de geração',
      description:
        'A instalação conta com 8 grupos geradores de 1.560 kVA, totalizando aproximadamente 12 MVA de capacidade instalada para atender uma operação de grande escala.',
    },
    {
      title: 'Redundância operacional',
      description:
        'A arquitetura N+1 distribuída em quatro blocos independentes permite que, dentro de cada bloco, um único grupo gerador seja capaz de atender 100% da carga correspondente em caso de falha ou manutenção do outro equipamento.',
    },
    {
      title: 'Segurança na transferência de energia',
      description:
        'O projeto conta com 8 sistemas de transferência em rampa e sistemas de Tie Breaker integrados aos painéis, compondo a arquitetura de transferência e redundância dos quatro blocos.',
    },
    {
      title: 'Robustez de abastecimento',
      description:
        'A infraestrutura possui quatro tanques de 30.000 litros, totalizando 120.000 litros de capacidade de armazenamento de combustível.',
    },
    {
      title: 'Execução turnkey',
      description:
        'A Essencial Energia foi responsável pelo fornecimento, instalação e comissionamento da solução, concentrando diferentes etapas do projeto em um único parceiro.',
    },
    {
      title: 'Continuidade durante a implantação',
      description:
        'Durante a execução da obra, foram disponibilizados 3 grupos geradores de 1.560 kVA em locação, criando uma camada adicional de proteção para a operação do Data Center.',
    },
  ],
  closingTitle: 'Engenharia, geração e continuidade em uma única solução',
  closing: [
    'O projeto de Cotia demonstra a capacidade da Essencial Energia de atuar em infraestruturas críticas de alta complexidade, integrando diferentes etapas da solução de energia em um único projeto.',
    'Da engenharia ao fornecimento dos equipamentos, passando pela instalação, comissionamento e locação durante a implantação, a atuação foi estruturada para atender às necessidades de uma operação em que a disponibilidade da energia é parte essencial do negócio.',
    'Em um Data Center, energia não é apenas infraestrutura. É a base que sustenta servidores, dados, sistemas, processos e operações que precisam permanecer disponíveis.',
    'Para uma operação crítica, não basta ter energia. É preciso ter uma estrutura preparada para garantir que ela esteja disponível quando for necessária.',
  ],
}
