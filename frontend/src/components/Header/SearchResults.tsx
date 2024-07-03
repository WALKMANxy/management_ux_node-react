// src/components/common/SearchResults.tsx
import React, { useEffect, useRef } from "react";
import { SearchResultsProps } from "../../models/models";
import { Card, CardContent, Typography } from "@mui/material";
import "./SearchResults.module.css";
import { generateRandomString } from "../../utils/constants";

const SearchResults: React.FC<SearchResultsProps> = ({
  onSelect,
  selectedIndex,
  results,
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  console.log("SearchResults render - Results:", results);
  console.log("SearchResults render - Selected Index:", selectedIndex);

  return (
    <div className="search-results" ref={resultsRef}>
      {results.length > 0 ? (
        results.map((result, index) => (
          <Card
            key={`${result.id}-${generateRandomString()}`}
            className={`search-result-item ${
              index === selectedIndex ? "selected" : ""
            }`}
            onClick={() => onSelect(result.name)}
            sx={{ marginBottom: 2 }}
          >
            <CardContent>
              <Typography variant="h6">{result.name}</Typography>
              {result.type === "article" && (
                <>
                  <Typography variant="body2">
                    Article ID: {result.articleId}
                  </Typography>
                  <Typography variant="body2">Brand: {result.brand}</Typography>
                  <Typography variant="body2">
                    {" "}
                    Last Sold: {result.lastSoldDate}
                  </Typography>
                </>
              )}
              {result.type === "client" && (
                <>
                  <Typography variant="body2">
                    Province: {result.province}
                  </Typography>
                  <Typography variant="body2">Phone: {result.phone}</Typography>
                  <Typography variant="body2">
                    Payment Method: {result.paymentMethod}
                  </Typography>
                </>
              )}
              {result.type === "promo" && (
                <>
                  <Typography variant="body2">
                    Discount Amount: {result.discountAmount}
                  </Typography>
                  <Typography variant="body2">
                    Start Date: {result.startDate}
                  </Typography>
                  <Typography variant="body2">
                    End Date: {result.endDate}
                  </Typography>
                </>
              )}
              <Typography variant="body2">Type: {result.type}</Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card className="search-result-item" sx={{ marginBottom: 2 }}>
          <CardContent>
            <Typography variant="body2">No results found</Typography>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SearchResults;
