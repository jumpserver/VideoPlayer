import { useState } from "react";
import { makeStyles, Button } from "@fluentui/react-components";
import {
  bundleIcon,
  CalendarMonthFilled,
  CalendarMonthRegular,
} from "@fluentui/react-icons";

import { invoke } from "@tauri-apps/api/core";

const CalendarMonth = bundleIcon(CalendarMonthFilled, CalendarMonthRegular);

const useStyles = makeStyles({
  wrapper: {
    columnGap: "15px",
    display: "flex",
  },
});

const App: React.FC = () => {
  const styles = useStyles();

  const [greeting, setGreeting] = useState("");

  const greet = async () => {
    setGreeting(await invoke("greet", { name: "World" }));
  };

  return (
    <div className={styles.wrapper}>
      <Button
        icon={<CalendarMonthRegular />}
        onClick={() => {
          greet();
        }}
      >
        Default
      </Button>
      <Button appearance="primary" icon={<CalendarMonthRegular />}>
        Primary
      </Button>
      <Button appearance="outline" icon={<CalendarMonth />}>
        Outline
      </Button>
      <Button appearance="subtle" icon={<CalendarMonth />}>
        Subtle
      </Button>
      <Button appearance="transparent" icon={<CalendarMonth />}>
        Transparent
      </Button>

      <p>{greeting}</p>
    </div>
  );
};

export default App;
