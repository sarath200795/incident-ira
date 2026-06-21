export const config = {
  "title": "Incident IRA",
  "tagline": "Incident Reporting & Analysis — a guided 5-step workflow from report to root-cause to closure.",
  "org": "Northwind Industrial",
  "port": 5173,
  "walkthrough": [
    {
      "route": "/app/dashboard",
      "title": "Incident dashboard",
      "sub": "Cross-filter by severity, type, HSE category and location; injury heatmap."
    },
    {
      "route": "/app/incidents/new",
      "title": "Report an incident",
      "sub": "Step 1: date, type, severity, location, narrative and affected personnel."
    },
    {
      "route": "/app/incidents",
      "title": "Incident register",
      "sub": "Every incident with its workflow status; resume or review at any time."
    },
    {
      "route": "/app/illness/new",
      "title": "Occupational illness",
      "sub": "Standalone illness reports — exposure, PPE, health issue and corrective actions."
    },
    {
      "route": "/app/actions",
      "title": "Action Tracker",
      "sub": "All corrective / preventive actions in one place, with overdue flags."
    }
  ],
  "closing": {
    "route": "/app/dashboard",
    "title": "Incident IRA — report, investigate, learn.",
    "sub": "Start by registering your organization."
  }
}
