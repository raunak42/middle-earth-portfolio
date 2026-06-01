"use client";

import { Loader } from "@react-three/drei";

export default function AppLoader() {
  return (
    <Loader
      initialState={() => true}
      dataInterpolation={(progressValue) => `${progressValue.toFixed(2)}%`}
      containerStyles={{ background: "#000000" }}
      innerStyles={{
        background: "rgba(255, 255, 255, 0.4)",
        borderRadius: 999,
        height: 6,
        width: 180,
      }}
      barStyles={{
        background: "#163522",
        borderRadius: 999,
        height: 6,
      }}
      dataStyles={{
        color: "#163522",
        fontSize: "0.9em",
        fontWeight: 900,
        marginTop: "6px",
      }}
    />
  );
}
