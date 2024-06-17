import React from 'react';

interface DetailProps {
  detail: { [key: string]: any };
}

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
