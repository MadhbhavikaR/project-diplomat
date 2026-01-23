export const getAgentIcon = (agentClass: string): string => {
  // TODO: Implement agent icon mapping
  switch(agentClass) {
    case 'LlmAgent':
      return 'psychology';
    case 'SequentialAgent':
      return 'more_horiz';
    case 'LoopAgent':
      return 'sync';
    case 'ParallelAgent':
      return 'density_medium';
    default:
      return 'psychology';
  }
};