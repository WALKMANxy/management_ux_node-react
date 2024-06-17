import React from 'react';
import Header from '../../components/Header/Header';
import DetailComponent from '../../components/common/DetailComponent';
import HistoryComponent from '../../components/common/HistoryComponent';
import './ClientsPage.css';

const mockDetail = {
  name: 'Client 1',
  id: '123',
  email: 'client1@example.com',
  phone: '123-456-7890',
};

const mockHistory = [
  { date: '2022-01-01', action: 'Order Placed', details: 'Order #123' },
  { date: '2022-02-15', action: 'Order Shipped', details: 'Order #123' },
];

const ClientsPage: React.FC = () => {
  return (
    <div className="clients-page">
      <Header />
      <div className="content">
        <DetailComponent detail={mockDetail} />
        <HistoryComponent history={mockHistory} />
      </div>
    </div>
  );
};

export default ClientsPage;
