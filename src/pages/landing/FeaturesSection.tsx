export default function FeaturesSection() {
  const features = [
    {
      icon: 'fa-solid fa-bullseye',
      title: 'Lead Capture & Organization',
      description:
        'Instantly capture lead details — name, company, contact info, and deal value — in one centralized workspace. No more scattered spreadsheets.',
    },
    {
      icon: 'fa-solid fa-comments',
      title: 'Communication History',
      description:
        'Log every call, email, and meeting on each lead profile. Build a complete timeline of every touchpoint so nothing falls through the cracks.',
    },
    {
      icon: 'fa-solid fa-bell',
      title: 'Follow-Up Reminders',
      description:
        'Schedule follow-up tasks with dates and notes. Overdue and upcoming reminders surface automatically so you never miss a critical touchpoint.',
    },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Everything you need to close more deals
          </h2>
          <p className="text-xl text-muted-foreground">
            LeadFlow gives sales professionals a focused, distraction-free
            workspace.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-8"
            >
              <i
                className={`${feature.icon} text-primary text-3xl mb-4 block`}
              />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
