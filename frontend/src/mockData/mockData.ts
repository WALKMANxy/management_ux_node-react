// src/mockData/mockData.ts

import { MockData } from '../models/models';

const mockData: MockData = {
  clients: [
    {
      id: '1',
      name: 'Client 1',
      province: 'CT',
      phone: '123-456-7890',
      totalOrders: 0, // Will be calculated
      totalRevenue: '', // Will be calculated
      unpaidRevenue: '', // Will be calculated
      address: '123 Main St',
      email: 'client1@example.com',
      visits: [
        { date: '2024-01-01', note: 'Initial consultation' },
        { date: '2024-02-15', note: 'Follow-up visit' },
        { date: '2024-03-10', note: 'Routine check' },
      ],
      agent: '1',
      movements: [
        { id: 'm1', type: 'part', name: 'Engine', category: 'Car Parts', price: '20000', amountPaid: '5000', unpaidAmount: '15000', paymentDueDate: '2024-02-10', dateOfOrder: '2024-01-10' },
        { id: 'm2', type: 'part', name: 'Brake Pads', category: 'Car Parts', price: '500', amountPaid: '500', unpaidAmount: '0', paymentDueDate: '2024-02-12', dateOfOrder: '2024-02-12' }
      ],
      promos: [
        { id: 'p1', name: 'Winter Sale', discount: '10%', startDate: '2024-01-01', endDate: '2024-01-31' }
      ]
    },
    {
      id: '2',
      name: 'Client 2',
      province: 'PA',
      phone: '123-456-7891',
      totalOrders: 0, // Will be calculated
      totalRevenue: '', // Will be calculated
      unpaidRevenue: '', // Will be calculated
      address: '456 Elm St',
      email: 'client2@example.com',
      visits: [
        { date: '2024-01-20', note: 'Initial consultation' },
        { date: '2024-03-10', note: 'Routine check' },
      ],
      agent: '2',
      movements: [
        { id: 'm3', type: 'part', name: 'Tires', category: 'Car Parts', price: '800', amountPaid: '800', unpaidAmount: '0', paymentDueDate: '2024-02-05', dateOfOrder: '2024-02-05' },
        { id: 'm4', type: 'part', name: 'Battery', category: 'Car Parts', price: '200', amountPaid: '0', unpaidAmount: '200', paymentDueDate: '2024-04-15', dateOfOrder: '2024-03-15' }
      ],
      promos: [
        { id: 'p2', name: 'Spring Sale', discount: '15%', startDate: '2024-03-01', endDate: '2024-03-31' }
      ]
    },
    {
      id: '3',
      name: 'Client 3',
      province: 'NY',
      phone: '123-456-7892',
      totalOrders: 0, // Will be calculated
      totalRevenue: '', // Will be calculated
      unpaidRevenue: '', // Will be calculated
      address: '789 Oak St',
      email: 'client3@example.com',
      visits: [
        { date: '2024-01-25', note: 'Initial consultation' },
        { date: '2024-03-12', note: 'Routine check' },
      ],
      agent: '1',
      movements: [
        { id: 'm5', type: 'part', name: 'Oil Filter', category: 'Car Parts', price: '600', amountPaid: '600', unpaidAmount: '0', paymentDueDate: '2024-02-20', dateOfOrder: '2024-02-20' },
        { id: 'm6', type: 'part', name: 'Windshield Wipers', category: 'Car Parts', price: '180', amountPaid: '80', unpaidAmount: '100', paymentDueDate: '2024-04-18', dateOfOrder: '2024-03-18' }
      ],
      promos: [
        { id: 'p3', name: 'Summer Sale', discount: '20%', startDate: '2024-06-01', endDate: '2024-06-30' }
      ]
    }
  ],
  agents: [
    {
      id: '1',
      name: 'Agent 1',
      email: 'agent1@example.com',
      phone: '123-456-7899',
      clients: [] // This will be filled programmatically
    },
    {
      id: '2',
      name: 'Agent 2',
      email: 'agent2@example.com',
      phone: '123-456-7898',
      clients: [] // This will be filled programmatically
    }
  ],
  promos: [
    { id: 'p1', name: 'Winter Sale', discount: '10%', startDate: '2024-01-01', endDate: '2024-01-31' },
    { id: 'p2', name: 'Spring Sale', discount: '15%', startDate: '2024-03-01', endDate: '2024-03-31' },
    { id: 'p3', name: 'Summer Sale', discount: '20%', startDate: '2024-06-01', endDate: '2024-06-30' }
  ],
  alerts: [
    { id: 'a1', message: 'Order #1234 delayed', date: '2024-01-10', severity: 'high' },
    { id: 'a2', message: 'New promo available', date: '2024-02-15', severity: 'low' },
    { id: 'a3', message: 'Client #3 payment overdue', date: '2024-03-05', severity: 'medium' }
  ]
};

// Calculate total orders, total revenue, and unpaid revenue for each client
mockData.clients.forEach(client => {
  const totalOrders = client.movements.length;
  const totalRevenue = client.movements.reduce((sum, movement) => sum + parseFloat(movement.price), 0);
  const unpaidRevenue = client.movements.reduce((sum, movement) => sum + parseFloat(movement.unpaidAmount), 0);
  
  client.totalOrders = totalOrders;
  client.totalRevenue = totalRevenue.toFixed(2);
  client.unpaidRevenue = unpaidRevenue.toFixed(2);
});

// Assign clients to agents
mockData.agents.forEach(agent => {
  agent.clients = mockData.clients.filter(client => client.agent === agent.id);
});

export default mockData;
