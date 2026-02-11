export function mapEspnStatus(state) {
  switch (state) {
    case 'pre':
      return 'scheduled';
    case 'in':
      return 'live';
    case 'post':
      return 'finished';
    default:
      return 'scheduled';
  }
}
