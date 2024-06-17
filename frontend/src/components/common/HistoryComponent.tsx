import React from 'react';

interface HistoryProps {
  history: { [key: string]: any }[];
}

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
