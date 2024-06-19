// src/components/common/DetailComponent.tsx
import React from 'react';
import { DetailProps } from '../../models/models';

const DetailComponent: React.FC<DetailProps> = ({ detail }) => {
  return (
    <div>
      {Object.keys(detail).map((key) => (
        <p key={key}>
          <strong>{key}:</strong> {detail[key]}
        </p>
      ))}
    </div>
  );
};

export default DetailComponent;
