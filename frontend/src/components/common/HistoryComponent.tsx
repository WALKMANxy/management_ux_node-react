// src/components/common/HistoryComponent.tsx
import React from 'react';
import { HistoryProps } from '../../models/models';

const HistoryComponent: React.FC<HistoryProps> = ({ history }) => {
  return (
    <ul>
      {history.map((item, index) => (
        <li key={index}>
          {Object.keys(item).map((key) => (
            <p key={key}>
              <strong>{key}:</strong> {item[key]}
            </p>
          ))}
        </li>
      ))}
    </ul>
  );
};

export default HistoryComponent;