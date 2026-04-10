# 📁 Project Repository Structure

This document represents the complete structure of the project repository.

```bash
.
├── docs
├── fault-service
│   ├── package-lock.json
│   ├── package.json
│   └── src
│       ├── controllers
│       │   └── faultController.js
│       ├── index.js
│       ├── models
│       │   └── faultModel.js
│       ├── routes
│       │   └── faultRoutes.js
│       └── services
│           └── faultService.js
├── frontend
│   ├── index.html
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── App.jsx
│   │   ├── app
│   │   │   ├── providers.jsx
│   │   │   └── router.jsx
│   │   ├── components
│   │   │   ├── common
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── EmptyState.jsx
│   │   │   │   ├── SectionHeader.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   └── StatusBadge.jsx
│   │   │   └── layout
│   │   │       ├── PageContainer.jsx
│   │   │       ├── Sidebar.jsx
│   │   │       └── Topbar.jsx
│   │   ├── constants
│   │   │   ├── routes.js
│   │   │   └── serviceConfig.js
│   │   ├── features
│   │   │   ├── dashboard
│   │   │   │   ├── components
│   │   │   │   │   ├── OverviewCards.jsx
│   │   │   │   │   └── SystemSnapshot.jsx
│   │   │   │   └── services
│   │   │   │       └── dashboardApi.js
│   │   │   ├── faults
│   │   │   │   ├── components
│   │   │   │   │   ├── FaultActionPanel.jsx
│   │   │   │   │   └── ServiceStatusList.jsx
│   │   │   │   └── services
│   │   │   │       └── faultApi.js
│   │   │   ├── regions
│   │   │   │   ├── components
│   │   │   │   │   ├── RegionForm.jsx
│   │   │   │   │   └── RegionList.jsx
│   │   │   │   └── services
│   │   │   │       └── regionApi.js
│   │   │   ├── resources
│   │   │   │   ├── components
│   │   │   │   │   ├── AllocationTable.jsx
│   │   │   │   │   └── InventoryTable.jsx
│   │   │   │   └── services
│   │   │   │       └── resourceApi.js
│   │   │   └── simulation
│   │   │       ├── components
│   │   │       │   ├── SimulationForm.jsx
│   │   │       │   └── SimulationResult.jsx
│   │   │       └── services
│   │   │           └── simulationApi.js
│   │   ├── hooks
│   │   │   └── usePolling.js
│   │   ├── main.jsx
│   │   ├── pages
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FaultsPage.jsx
│   │   │   ├── RegionsPage.jsx
│   │   │   ├── ResourcesPage.jsx
│   │   │   └── SimulationPage.jsx
│   │   ├── services
│   │   │   └── apiClient.js
│   │   ├── styles
│   │   │   └── globals.css
│   │   └── utils
│   │       └── formatters.js
│   └── vite.config.js
├── gateway-service
├── generate_repo_map.py
├── region-service
│   ├── .env.example
│   ├── package-lock.json
│   ├── package.json
│   └── src
│       ├── controllers
│       │   └── regionController.js
│       ├── db
│       │   └── supabaseClient.js
│       ├── events
│       │   └── publisher.js
│       ├── index.js
│       ├── models
│       │   └── regionModel.js
│       ├── routes
│       │   └── regionRoutes.js
│       └── services
│           └── regionService.js
├── resource-service
│   ├── package-lock.json
│   ├── package.json
│   └── src
│       ├── controllers
│       │   └── resourceController.js
│       ├── index.js
│       ├── models
│       │   └── resourceModel.js
│       ├── routes
│       │   └── resourceRoutes.js
│       └── services
│           └── resourceService.js
├── shared
└── simulation-service
    ├── package-lock.json
    ├── package.json
    └── src
        ├── index.js
        ├── services
        │   └── simulationLogic.js
        └── utils
            └── httpClient.js
```

## 📌 Description
- Organized DevOps pipeline structure
- Separate modules for Docker, Terraform, Kubernetes, Ansible, and CI/CD
- Follows industry-level modular architecture
