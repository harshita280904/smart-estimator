# TradeQuote Pro - Price Estimation Tool

A comprehensive React-based price estimation tool designed specifically for Australian tradesmen and MSMEs (Micro, Small & Medium Enterprises). This SaaS-ready application helps tradespeople quickly estimate material costs, compare suppliers, and generate professional quotes for customers.

## 🚀 Features

### 1. **Project Input Stage**
- Upload plans (PDF/CAD files) or manually enter dimensions
- Select from various project types: wall, floor, ceiling, roof, whole room/house
- Automatic conversion of dimensions to measurable areas/volumes
- Smart dimension validation and calculation

### 2. **Material Selection**
- **Smart suggestions** based on project type:
  - **Wall projects**: plasterboard, insulation, paint, bricks, mortar
  - **Floor projects**: tiles, timber, carpet, adhesives
  - **Roof projects**: roofing materials, steel sheets, framing timber
- Material library with Australian brands (Gyprock, Dulux, Bunnings, etc.)
- Save and reuse material lists from past jobs
- Set preferred brands and suppliers
- Add custom materials for specialty items

### 3. **Quantity Calculator**
- **Industry-standard formulas**:
  - Paint coverage: wall area ÷ coverage per litre
  - Plasterboard: wall area ÷ sheet size + wastage %
  - Tiles: floor area ÷ tile size + wastage
- **Auto-add consumables**: screws, adhesives, spacers
- **Adjustable wastage percentage** (5-25%)
- **Labour productivity tracking**:
  - Bricks per day per bricklayer
  - Square metres per day for painters/tilers
- Professional Bill of Quantities (BoQ) generation

### 4. **Supplier Comparison**
- **Multi-supplier pricing**: Bunnings, Mitre 10, TradeZone, Local suppliers
- **Compare by criteria**:
  - 💰 **Cheapest option** (total cost optimization)
  - ⚡ **Fastest delivery** (lead time optimization)
  - ⭐ **Preferred suppliers** (local/trusted suppliers)
- Real-time delivery fee calculation
- Stock availability tracking
- Supplier ratings and reviews

### 5. **Professional Quote Builder**
- **Complete quote generation** with:
  - Company branding (logo, ABN, contact details)
  - Client information management
  - Material costs breakdown
  - Labour costs (optional)
  - Markup percentage control
  - **GST calculation** (automatic 10% Australian GST)
- **Multiple export formats**:
  - 📄 **PDF quotes** (printable, professional)
  - 📊 **CSV exports** (for accounting software)
  - Email-ready formatting

### 6. **Memory & Project Management**
- Save past projects with dimensions and material choices
- One-click reuse for similar jobs
- Supplier preference memory
- Project analytics and cost tracking

## 🛠️ Technology Stack

- **Frontend**: React 19+ with modern hooks
- **Styling**: Custom CSS with CSS Grid and Flexbox
- **Build Tool**: Vite for fast development and building
- **State Management**: React useState and props drilling
- **Data Storage**: LocalStorage for demo (database-ready)

## 📊 Key Outputs

1. **Bill of Quantities (BoQ)**: Detailed itemized breakdown with quantities, units, and costs
2. **Supplier Order Lists**: Ready-to-place orders with contact information
3. **Professional Client Quotes**: Branded documents with GST, markup, and terms
4. **Cost Analysis**: Supplier comparison and margin analysis

## 🇦🇺 Australian Market Focus

- **Currency**: All prices in AUD
- **Suppliers**: Integration-ready for major Australian suppliers
- **Materials**: Australian building standards and materials
- **GST**: Automatic 10% GST calculation
- **ABN**: Company ABN integration for professional quotes
- **Measurements**: Metric system (metres, square metres)

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-estimator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5173`

### Build for Production
```bash
npm run build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ProjectInput.jsx      # Dimension input and project setup
│   ├── MaterialSelection.jsx # Material library and selection
│   ├── QuantityCalculator.jsx # Quantity calculations and BoQ
│   ├── SupplierComparison.jsx # Supplier pricing and comparison
│   └── QuoteBuilder.jsx      # Professional quote generation
├── App.jsx                   # Main application with step navigation
├── App.css                   # Professional styling
└── main.jsx                  # React application entry point
```

## 🎯 Target Users

- **Builders** and **General Contractors**
- **Plumbers**, **Electricians**, **Carpenters**
- **Tilers**, **Painters**, **Roofers**
- **Small Construction Companies**
- **Renovation Specialists**
- **Building Suppliers** (for customer estimation)

## 💡 Future Enhancements

1. **API Integrations**:
   - Real-time supplier pricing APIs
   - Direct ordering integration
   - Accounting software integration (Xero, MYOB)

2. **Advanced Features**:
   - AI-powered plan recognition
   - 3D visualization
   - Project timeline estimation
   - Weather impact calculations

3. **Business Features**:
   - Multi-user team accounts
   - Customer relationship management
   - Invoice generation
   - Payment processing

## 📱 Mobile Responsiveness

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Touch-enabled devices

## 🔒 Data Security

- Client data stored locally (demo version)
- Database-ready architecture for production
- Secure quote generation
- Export capabilities for data portability

## 📈 Business Model

**SaaS-Ready Features**:
- Subscription-based pricing
- Usage analytics
- Team collaboration
- Cloud storage integration
- API access for enterprise clients

## 🤝 Contributing

This project demonstrates modern React development practices and is ready for production deployment with minimal modifications for database integration and API connections.

## 📄 License

Built for HackANU 2024 - Practical SaaS tools for Australian MSMEs using modern web technologies.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
