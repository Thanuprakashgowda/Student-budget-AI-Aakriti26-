// UN Sustainable Development Goals data for impact dashboard
const SDG_DATA = [
  {
    id: 1,
    goal: 'SDG 1',
    title: 'No Poverty',
    icon: '🌍',
    color: '#E5243B',
    description: 'Empowering students to break the poverty cycle through financial literacy',
    metric: '₹24,500',
    metricLabel: 'saved by users this month',
    impact: 'Students who track expenses save 30% more on average',
    stats: [
      { label: 'Avg Monthly Savings', value: '₹2,450' },
      { label: 'Students Benefited', value: '1,240' },
      { label: 'Budget Adherence', value: '78%' }
    ]
  },
  {
    id: 8,
    goal: 'SDG 8',
    title: 'Decent Work & Economic Growth',
    icon: '💼',
    color: '#A21942',
    description: 'Building financial skills that drive economic independence',
    metric: '10,000+',
    metricLabel: 'students gaining financial skills',
    impact: 'Users develop budgeting habits that last a lifetime',
    stats: [
      { label: 'Active Users', value: '10,240' },
      { label: 'Expenses Tracked', value: '48,500' },
      { label: 'Goal Completion', value: '65%' }
    ]
  },
  {
    id: 12,
    goal: 'SDG 12',
    title: 'Responsible Consumption',
    icon: '♻️',
    color: '#BF8B2E',
    description: 'Promoting mindful spending and sustainable consumption patterns',
    metric: '23%',
    metricLabel: 'reduction in impulsive spending',
    impact: 'AI categorization helps students identify wasteful patterns',
    stats: [
      { label: 'Unnecessary Spend Cut', value: '₹8,200' },
      { label: 'Budget Alerts Sent', value: '3,890' },
      { label: 'Avg Savings Rate', value: '18%' }
    ]
  }
];

const PITCH_METRICS = {
  savingsBoost: '30%',
  studentReach: '10,000+',
  accuracyRate: '85%',
  citiesReached: '12',
  totalTracked: '₹4.8M',
  activeStreaks: '2,340'
};

module.exports = { SDG_DATA, PITCH_METRICS };
