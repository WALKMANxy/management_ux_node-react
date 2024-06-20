This is an example of the json:

{
    "Data Documento Precedente": "2024-04-10T00:00:00.000",
    "Mese": 4,
    "Anno": 2024,
    "Ragione Sociale Cliente": "086S.E.A. SERVIZI ECOLOGICI",
    "Codice Cliente": 2709,
    "Codice Agente": 11.0,
    "Identificativo Articolo": 158626.0,
    "Codice Articolo": "968018",
    "Marca Articolo": "EMMER",
    "Descrizione Articolo": "CILINDRO DOPPIO FRENI A CUNEO",
    "Valore": 141.6,
    "Costo": 118.0,
    "Numero Lista": 12170,
    "Prezzo Articolo": 141.6,
    "Categoria Sconto Vendita": "PN"
  },

Off the top of my hand, we're gonna map it this way:

clients: [
    {
      id: "1", // codice cliente
      name: "Client 1", //ragione sociale cliente
      province: "CT", // we currently don't have this, so we'll keep it empty.
      phone: "123-456-7890", // we currently don't have this, so we'll keep it empty.
      totalOrders: 0, // Will be calculated based on the how many unique Numero Lista a specific ragione sociale cliente has
      totalRevenue: "", // Will be calculated by the sum of the valore of all movements of a specific ragione sociale cliente
      unpaidRevenue: "", //we currently don't have this, so we'll keep it empty.
      address: "123 Main St", //we currently don't have this, so we'll keep it empty.
      email: "client1@example.com", //we currently don't have this, so we'll keep it empty.
      visits: [ //we currently don't have this, so we'll keep it empty.
        { date: "2024-01-01", note: "Initial consultation" },
        { date: "2024-02-15", note: "Follow-up visit" },
        { date: "2024-03-10", note: "Routine check" },
      ],
      agent: "1", // we can use the unique codice agente associated to a specific Ragione Sociale Cliente to map the agents to their specific Clients
      movements: [ // we can use the unique numero lista associated to a specific Ragione Sociale Cliente to map the movements to their specific Clients
        {
          id: "m1", // we'll assign an unique id to each movement by using the numero lista plus the agent plus the month and year plus a random string of 6 digits.
          // we'll add another thing to this nested json: articleId : "Codice Articolo"
          type: "part", // we'll modify this to brand : "brandname" using the marca articolo, this will be a nested json in case there are more than one movements with the same numero lista, meaning a this is just a part of a greater movement
          name: "Engine", // we'll use the descrizione articolo to assign a name, this will be a nested json in case there are more than one movements with the same numero lista, meaning a this is just a part of a greater movement
          category: "Car Parts", // we'll replace this with "Categoria Sconto Vendita", if we have it, so it'll be discountCategory : "Categoria Sconto Vendita", this is unique to each ragion sociale cliente 
          price: "20000", // we'll use Valore to assign the priceToSell a value, this will be a nested json in case there are more than one movements with the same numero lista, meaning a this is just a part of a greater movement
          amountPaid: "5000", // we'll replace this with costo, meaning PriceToBuy : "Costo", this will be a nested json in case there are more than one movements with the same numero lista, meaning a this is just a part of a greater movement
          unpaidAmount: "15000", // we currently don't have this, so we'll keep it empty
          paymentDueDate: "2024-02-10", // we currently don't have this, so we'll keep it empty  
          dateOfOrder: "2024-01-10", // we will use Data Documento Precedente to assign a date, ignoring the time, so taking this as an example: "2024-04-10T00:00:00.000" we will take the year as 2024, the month as 04, the day as 10, and disregard everything else.
        },
       
      ],
      promos: [
        {
          id: "p1",  // we currently don't have this, so we'll keep it empty
          name: "Winter Sale", // we currently don't have this, so we'll keep it empty
          discount: "10%", // we currently don't have this, so we'll keep it empty
          startDate: "2024-01-01", // we currently don't have this, so we'll keep it empty
          endDate: "2024-01-31", // we currently don't have this, so we'll keep it empty
        },
      ],
    },


    2. Movement Mapping:
id: Generated unique ID using Numero Lista, Codice Agente, Mese, Anno, and a random string
articleId: Codice Articolo
type: Categoria Sconto Vendita
name: Descrizione Articolo
category: Marca Articolo
price: Prezzo Articolo
amountPaid: Costo
unpaidAmount: (empty for now)
paymentDueDate: (empty for now)
dateOfOrder: Data Documento Precedente (formatted to exclude time)

There are mistakes here. This: type: Categoria Sconto Vendita has to become discountCategory : "Categoria Sconto Vendita", this: category: Marca Articolo has to become brand : "Marca Articolo", this: price: Prezzo Articolo has to become priceSold : "Valore", this: amountPaid: "5000" has to become priceBought : "Costo". Ok?


//No, that's not how we planned it. Isn't this modified version the correct one?

{
    "clients": [
      {
        "id": "2709",
        "name": "086S.E.A. SERVIZI ECOLOGICI",
        "province": "",
        "phone": "",
        "totalOrders": 1,
        "totalRevenue": "848.81",
        "unpaidRevenue": "",
        "address": "",
        "email": "",
        "visits": [],
        "agent": "11",
        "movements": [
          {
            "id": "12170", // just the Numero Lista
            "discountCategory": "PN", //it's a single type for each different client, so this is fine 
            "details": [
              {
                "articleId": "158626", //we have to add this to each article, since eac article has its own article id.
                "name": "CILINDRO DOPPIO FRENI A CUNEO",
                "brand": "EMMER",
                "priceSold": "141.60",
                "priceBought": "118.00"
              },
              {
                //we have to add this to each article, since eac article has its own article id.
                "articleId": "12312e",
                "name": "DISCO FRENO",
                "brand": "SBP",
                "priceSold": "32.36",
                "priceBought": "26.97"
              }
            ],
            "unpaidAmount": "",
            "paymentDueDate": "",
            "dateOfOrder": "2024-04-10"
          }
        ],
        "promos": []
      }
    ]
  }


  For what regards the landing page, we also have to modify our login logic.

Currently in the JSON, the agent ids are as follows, meaning codice Agente:

10, 11, 12, 13, 14, 15, 16, 50, 90, 91, 92, 95, 99.

So for our mock login, we have to provide the option to log in as either one of these agents, so the logic to show the associated clients and movements etcetera will work and we'll be able to test it.

Please remember that we're also using RTK Query. I'll post all the relevant code to the LandingPage, and you'll tell me how to proceed correctly following best practices in React:

// src/app/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Use throughout your app instead of plain useDispatch and useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// src/app/store.ts
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "../features/auth/authSlice";
import searchReducer from "../features/search/searchSlice";
import { api } from "../services/api";

const store = configureStore({
reducer: {
auth: authReducer,
search: searchReducer,
[api.reducerPath]: api.reducer,
},
middleware: (getDefaultMiddleware) =>
getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;

// src/features/auth/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, UserRole } from "../../models/models";

interface LoginPayload {
role: UserRole;
id?: string;
}

const initialState: AuthState = {
isLoggedIn: false,
userRole: "guest", // default to guest
id: null, // add userId field
};

const authSlice = createSlice({
name: "auth",
initialState,
reducers: {
login(state, action: PayloadAction<LoginPayload>) {
state.isLoggedIn = true;
state.userRole = action.payload.role;
state.id = action.payload.id || null;
},
logout(state) {
state.isLoggedIn = false;
state.userRole = "guest"; // default to guest
state.id = null;
},
},
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;

import { useEffect, useState } from "react";
import { Client, Agent, Movement } from "../models/models";
import { loadJsonData, mapDataToModels } from "../utils/dataLoader";

const useAgentStats = (agentId: string | null) => {
const [agentDetails, setAgentDetails] = useState<Agent | null>(null);
const [selectedClient, setSelectedClient] = useState<Client | null>(null);

useEffect(() => {
const fetchAgentDetails = async () => {
console.log("Fetching agent details for:", agentId);
const data = await loadJsonData("/datasetsfrom01JANto12JUN.json");
const clients = mapDataToModels(data);

javascript
Copy code
  const agentClients = clients.filter((client) => client.agent === agentId);
  const agent = { id: agentId!, name: `Agent ${agentId}`, clients: agentClients };
  setAgentDetails(agent);
};

if (agentId) {
  fetchAgentDetails();
}
}, [agentId]);

const calculateTotalSpentThisMonth = (movements: Movement[]) => {
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();
return movements
.filter((movement) => {
const movementDate = new Date(movement.dateOfOrder);
return (
movementDate.getMonth() + 1 === currentMonth &&
movementDate.getFullYear() === currentYear
);
})
.reduce(
(total, movement) =>
total +
movement.details.reduce(
(sum, detail) => sum + parseFloat(detail.priceSold),
0
),
0
)
.toFixed(2);
};

const calculateTotalSpentThisYear = (movements: Movement[]) => {
const currentYear = new Date().getFullYear();
return movements
.filter(
(movement) => new Date(movement.dateOfOrder).getFullYear() === currentYear
)
.reduce(
(total, movement) =>
total +
movement.details.reduce(
(sum, detail) => sum + parseFloat(detail.priceSold),
0
),
0
)
.toFixed(2);
};

const calculateTopArticleType = (movements: Movement[]) => {
const typeCount: { [key: string]: number } = {};
movements.forEach((movement) => {
movement.details.forEach((detail) => {
if (typeCount[detail.name]) {
typeCount[detail.name]++;
} else {
typeCount[detail.name] = 1;
}
});
});
return Object.keys(typeCount).reduce(
(a, b) => (typeCount[a] > typeCount[b] ? a : b),
""
);
};

const selectClient = (clientId: string) => {
console.log("Selecting client:", clientId);
const client = agentDetails?.clients.find((client) => client.id === clientId);
if (client) {
setSelectedClient(client);
} else {
console.error("Client not found for this agent");
}
};

return {
agentDetails,
selectedClient,
selectClient,
calculateTotalSpentThisMonth,
calculateTotalSpentThisYear,
calculateTopArticleType,
};
};

export default useAgentStats;

import { useState, useRef, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../app/store";
import DOMPurify from "dompurify";
import { setQuery, searchItems } from "../features/search/searchSlice";
import useDebounce from "../hooks/useDebounce";
import { loadJsonData, mapDataToModels } from "../utils/dataLoader";

const useGlobalSearch = (filter: string) => {
const [input, setInput] = useState("");
const dispatch = useDispatch<AppDispatch>();
const searchRef = useRef<HTMLDivElement>(null);
const [showResults, setShowResults] = useState(false);
const [selectedIndex, setSelectedIndex] = useState(-1);
const debouncedInput = useDebounce(input, 300);
const results = useSelector((state: RootState) => state.search.results);

const handleSearch = useCallback(() => {
const sanitizedInput = DOMPurify.sanitize(debouncedInput.trim());
if (sanitizedInput === "") {
setShowResults(false);
return;
}
dispatch(setQuery(sanitizedInput));
dispatch(searchItems({ query: sanitizedInput, filter }));
setShowResults(true);
}, [dispatch, debouncedInput, filter]);

const handleKeyDown = (event: React.KeyboardEvent) => {
if (event.key === "Enter") {
if (selectedIndex >= 0 && selectedIndex < results.length) {
setShowResults(false);
setSelectedIndex(-1);
} else {
handleSearch();
}
} else if (event.key === "ArrowDown") {
setSelectedIndex((prevIndex) => (prevIndex + 1) % results.length);
} else if (event.key === "ArrowUp") {
setSelectedIndex(
(prevIndex) => (prevIndex - 1 + results.length) % results.length
);
}
};

const handleClickOutside = useCallback((event: MouseEvent) => {
if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
setShowResults(false);
setSelectedIndex(-1);
}
}, []);

useEffect(() => {
document.addEventListener("mousedown", handleClickOutside);
return () => {
document.removeEventListener("mousedown", handleClickOutside);
};
}, [handleClickOutside]);

useEffect(() => {
if (debouncedInput) {
handleSearch();
}
}, [debouncedInput, handleSearch]);

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setInput(e.target.value);
setSelectedIndex(-1);
};

const handleFocus = () => {
setShowResults(true);
setSelectedIndex(-1);
};

return {
input,
handleChange,
handleKeyDown,
handleFocus,
showResults,
searchRef,
results,
selectedIndex,
setShowResults,
setSelectedIndex,
};
};

export default useGlobalSearch;

// src/models/models.ts

export type UserRole = "admin" | "agent" | "client" | "guest";

export type AuthState = {
isLoggedIn: boolean;
userRole: UserRole;
id: string | null;
};

export type SearchResult = {
id: string;
name: string;
type: string;
};

export type SearchParams = {
query: string;
filter: string;
results?: SearchResult[];
};

export type SearchState = {
query: string;
results: SearchResult[];
status: "idle" | "loading" | "succeeded" | "failed";
error: string | null;
};

export type GlobalSearchProps = {
filter?: string;
onSelect?: (item: string) => void;
placeholder?: string;
};

export type DetailProps = {
detail: { [key: string]: any };
};

export type HistoryProps = {
history: { [key: string]: any }[];
};

export type SearchResultsProps = {
onSelect: (item: string) => void;
selectedIndex: number;
results: SearchResult[];
};

export type SidebarProps = {
onToggle: (isOpen: boolean) => void;
};

export type Visit = {
date: string;
note: string;
};

export type MovementDetail = {
articleId: string;
name: string;
brand: string;
priceSold: string;
priceBought: string;
};

export type Movement = {
id: string;
discountCategory: string;
details: MovementDetail[];
unpaidAmount: string;
paymentDueDate: string;
dateOfOrder: string;
};

export type Promo = {
id: string;
name: string;
discount: string;
startDate: string;
endDate: string;
};

export type Client = {
id: string;
name: string;
province: string;
phone: string;
totalOrders: number;
totalRevenue: string;
unpaidRevenue: string;
address: string;
email: string;
visits: Visit[];
agent: string;
movements: Movement[];
promos: Promo[];
};

export type Agent = {
id: string;
name: string;
email?: string;
phone?: string;
clients: Client[];
};

export type Alert = {
id: string;
message: string;
date: string;
severity: "low" | "medium" | "high";
};

export type MockData = {
clients: Client[];
agents: Agent[];
promos: Promo[];
alerts: Alert[];
};

// src/pages/landing/LandingPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../features/auth/authSlice";
import { RootState } from "../../app/store";
import {
AppBar,
Toolbar,
Typography,
Button,
Menu,
MenuItem,
Container,
Box,
Select,
FormControl,
InputLabel,
Grid,
Paper,
} from "@mui/material";
import mockData from "../../mockData/mockData";

const LandingPage: React.FC = () => {
const [showLogin, setShowLogin] = useState(false);
const [selectedRole, setSelectedRole] = useState<
"admin" | "agent" | "client"

("client");
const [selectedAgent, setSelectedAgent] = useState<string>(""); // State for selected agent
const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
const userRole = useSelector((state: RootState) => state.auth.userRole);
const dispatch = useDispatch();
const navigate = useNavigate();

const handleLogin = () => {
if (selectedRole === "agent" && selectedAgent) {
dispatch(login({ role: selectedRole, id: selectedAgent }));
} else {
dispatch(login({ role: selectedRole, id: "" }));
}
setShowLogin(false);
};

const handleEnterDashboard = () => {
switch (userRole) {
case "admin":
navigate("/admin-dashboard");
break;
case "agent":
navigate("/agent-dashboard");
break;
case "client":
navigate("/client-dashboard");
break;
default:
navigate("/");
}
};

return (
<Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
<AppBar position="static">
<Toolbar sx={{ justifyContent: "space-between" }}>
<Typography variant="h6">Logo</Typography>
<Button color="inherit" onClick={() => setShowLogin(!showLogin)}>
Login
</Button>
</Toolbar>
</AppBar>
{showLogin && (
<Menu
anchorEl={document.body}
anchorOrigin={{ vertical: "top", horizontal: "right" }}
open={showLogin}
onClose={() => setShowLogin(false)}
sx={{ marginTop: "48px" }}
>
<MenuItem>
<FormControl fullWidth>
<InputLabel>User Role</InputLabel>
<Select
value={selectedRole}
onChange={(e) =>
setSelectedRole(
e.target.value as "admin" | "agent" | "client"
)
}
>
<MenuItem value="admin">Admin</MenuItem>
<MenuItem value="agent">Agent</MenuItem>
<MenuItem value="client">Client</MenuItem>
</Select>
</FormControl>
</MenuItem>
{selectedRole === "agent" && (
<MenuItem>
<FormControl fullWidth>
<InputLabel>Select Agent</InputLabel>
<Select
value={selectedAgent}
onChange={(e) => setSelectedAgent(e.target.value)}
>
{mockData.agents.map((agent) => (
<MenuItem key={agent.id} value={agent.id}>
{agent.name}
</MenuItem>
))}
</Select>
</FormControl>
</MenuItem>
)}
<MenuItem>
<Button
           variant="contained"
           color="primary"
           onClick={handleLogin}
           fullWidth
         >
Login
</Button>
</MenuItem>
</Menu>
)}
<Container
component="main"
sx={{
flex: 1,
display: "flex",
flexDirection: "column",
justifyContent: "center",
alignItems: "center",
padding: "2rem",
}}
>
<Typography variant="h1" align="center" gutterBottom>
Welcome
</Typography>
<Box
sx={{
width: "100%",
display: "flex",
justifyContent: "center",
alignItems: "center",
marginTop: "2rem",
}}
>
<Paper elevation={3} sx={{ padding: "2rem" }}>
<Grid container spacing={2}>
<Grid item xs={12}>
<Button variant="contained" fullWidth>
Link 1
</Button>
</Grid>
<Grid item xs={12}>
<Button variant="contained" fullWidth>
Link 2
</Button>
</Grid>
<Grid item xs={12}>
<Button variant="contained" fullWidth>
Link 3
</Button>
</Grid>
<Grid item xs={12}>
<Button variant="contained" fullWidth>
Link 4
</Button>
</Grid>
</Grid>
</Paper>
</Box>
{isLoggedIn && (
<Button
variant="contained"
color="primary"
size="large"
sx={{ marginTop: "2rem" }}
onClick={handleEnterDashboard}
>
Enter Dashboard
</Button>
)}
</Container>
<Box
component="footer"
sx={{
backgroundColor: "#d5f5d3",
color: "#000",
padding: "1rem",
textAlign: "center",
}}
>
<Container>
<Box display="flex" justifyContent="space-between">
<Typography>© 2024 Developed By ****</Typography>
<Typography>Business Contact: example@example.com</Typography>
</Box>
</Container>
</Box>
</Box>
);
};

export default LandingPage;

// src/services/api.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Client } from '../models/models';
import { loadJsonData, mapDataToModels } from '../utils/dataLoader';

export const api = createApi({
reducerPath: 'api',
baseQuery: fetchBaseQuery({ baseUrl: '/' }),
endpoints: (builder) => ({
getClients: builder.query<Client[], void>({
queryFn: async () => {
try {
const data = await loadJsonData('datasetsfrom01JANto12JUN.json');
const clients = mapDataToModels(data);
return { data: clients };
} catch (error) {
const errorMessage = (error as Error).message;
return { error: { status: 'CUSTOM_ERROR', error: errorMessage } };
}
},
}),
}),
});

export const { useGetClientsQuery } = api;

// src/utils/dataLoader.ts
import { Client, Movement, MovementDetail } from '../models/models';

export const loadJsonData = async (url: string): Promise<any[]> => {
const response = await fetch(url);
if (!response.ok) {
throw new Error(Failed to load data from ${url});
}
const data = await response.json();
return data;
};

export const mapDataToModels = (data: any[]): Client[] => {
const clientsMap = new Map<string, any[]>();

data.forEach(item => {
const clientId = item["Codice Cliente"].toString();
if (!clientsMap.has(clientId)) {
clientsMap.set(clientId, []);
}
clientsMap.get(clientId)!.push(item);
});

return Array.from(clientsMap.values()).map(mapToClient);
};

const mapToClient = (clientData: any[]): Client => {
const clientInfo = clientData[0];
const movementsMap = new Map<string, any[]>();

clientData.forEach(item => {
const movementId = item["Numero Lista"].toString();
if (!movementsMap.has(movementId)) {
movementsMap.set(movementId, []);
}
movementsMap.get(movementId)!.push(item);
});

const movements: Movement[] = Array.from(movementsMap.values()).map(mapToMovement);

const totalRevenue = movements.reduce((acc, movement) => {
return acc + movement.details.reduce((sum, detail) => sum + parseFloat(detail.priceSold), 0);
}, 0).toFixed(2);

const totalOrders = movementsMap.size;

return {
id: clientInfo["Codice Cliente"].toString(),
name: clientInfo["Ragione Sociale Cliente"],
province: "",
phone: "",
totalOrders,
totalRevenue,
unpaidRevenue: "", // Placeholder for now
address: "",
email: "",
visits: [], // Placeholder for now
agent: clientInfo["Codice Agente"].toString(),
movements,
promos: [] // Placeholder for now
};
};

const mapToMovement = (movementData: any[]): Movement => {
const movementInfo = movementData[0];

return {
id: movementInfo["Numero Lista"].toString(),
discountCategory: movementInfo["Categoria Sconto Vendita"],
details: movementData.map((item: any): MovementDetail => ({
articleId: item["Codice Articolo"].toString(),
name: item["Descrizione Articolo"],
brand: item["Marca Articolo"],
priceSold: item["Valore"].toFixed(2),
priceBought: item["Costo"].toFixed(2)
})),
unpaidAmount: "", // Placeholder for now
paymentDueDate: "", // Placeholder for now
dateOfOrder: movementInfo["Data Documento Precedente"].split('T')[0]
};
};