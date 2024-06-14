import React, { useEffect, useState } from 'react';

const ExampleComponent: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate an API call
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Mocking an API response
        const response = await new Promise<{ message: string }>((resolve) =>
          setTimeout(() => resolve({ message: 'This is a mock response from the example API endpoint.' }), 1000)
        );
        setData(response);
      } catch (err) {
        setError('An error occurred while fetching data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Example Data</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default ExampleComponent;
