import { Timeline } from "@mui/icons-material";
import { timelineItemClasses, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from "@mui/lab";
import { Card, CardHeader, Typography } from "@mui/material";
import PropTypes from "prop-types";


const AgentActivityOverview: React.FC<{ list: any[] }> = ({ list }) => {
  return (
    <Card>
      <CardHeader title="Agent Activity Overview" />

      <Timeline
        sx={{
          m: 0,
          p: 3,
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        {list.map((item, index) => (
          <OrderItem key={item.id} item={item} lastTimeline={index === list.length - 1} />
        ))}
      </Timeline>
    </Card>
  );
};

AgentActivityOverview.propTypes = {
  list: PropTypes.array.isRequired,
};

const OrderItem: React.FC<{ item: any; lastTimeline: boolean }> = ({ item, lastTimeline }) => {
  const { type, title, time } = item;
  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot
           color={
            (type === "visits" && "primary") ||
            (type === "sales" && "success") ||
            (type === "alerts" && "error") ||
            "grey" // Fallback color
          }
        />
        {lastTimeline ? null : <TimelineConnector />}
      </TimelineSeparator>

      <TimelineContent>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {time}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  );
};

OrderItem.propTypes = {
  item: PropTypes.object.isRequired,
  lastTimeline: PropTypes.bool.isRequired,
};

export default AgentActivityOverview;
