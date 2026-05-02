"use client";

import { useEffect, useRef, useState } from "react";
import { Exam, Score } from "@/types/exam";

type Props = {
  exam: Exam;
};

const scoreColours: Record<string, string> = {
  "0": "#E74C3C", // red
  "1": "#F1C40F", // yellow
  "2": "#2ECC71", // green
};

function levelToSvgLevel(side: "right" | "left", level: string) {
  return `${side}-${level.toLowerCase().replace("_", "-")}`;
}

function getScoreColour(score: Score) {
  return scoreColours[String(score)] || "#F9F9F9";
}

export default function BodyDiagram({ exam }: Props) {
  const [svgHtml, setSvgHtml] = useState("");
  const diagramRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadSvg() {
      const response = await fetch("/diagram.svg");

      if (!response.ok) {
        console.error("Could not load /diagram.svg");
        return;
      }

      const text = await response.text();
      setSvgHtml(text);
    }

    loadSvg();
  }, []);

  useEffect(() => {
    if (!svgHtml || !diagramRef.current) return;

    const diagramElement = diagramRef.current;

    (["right", "left"] as const).forEach((side) => {
      Object.keys(exam[side].lightTouch).forEach((level) => {
        const svgLevel = levelToSvgLevel(side, level);

        const lightTouchScore = exam[side].lightTouch[level];
        const pinPrickScore = exam[side].pinPrick[level];

        const lightTouchColour = getScoreColour(lightTouchScore);
        const pinPrickColour = getScoreColour(pinPrickScore);

        const paths = diagramElement.querySelectorAll(
          `[data-level="${svgLevel}"]`
        );

        paths.forEach((path) => {
          if (!(path instanceof SVGElement)) return;

          const parent = path.parentElement;
          if (!parent) return;

          const originalPath = path as SVGPathElement;
          const originalD = originalPath.getAttribute("d");

          if (!originalD) return;

          const existingLayers = parent.querySelectorAll(
            `[data-generated-layer="${svgLevel}"]`
          );

          existingLayers.forEach((layer) => layer.remove());

          originalPath.style.fill = "#F9F9F9";
          originalPath.style.fillOpacity = "1";

          const lightTouchLayer = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );

          lightTouchLayer.setAttribute("d", originalD);
          lightTouchLayer.setAttribute("fill", lightTouchColour);
          lightTouchLayer.setAttribute("fill-opacity", "0.5");
          lightTouchLayer.setAttribute("data-generated-layer", svgLevel);
          lightTouchLayer.setAttribute("pointer-events", "none");

          const pinPrickLayer = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );

          pinPrickLayer.setAttribute("d", originalD);
          pinPrickLayer.setAttribute("fill", pinPrickColour);
          pinPrickLayer.setAttribute("fill-opacity", "0.5");
          pinPrickLayer.setAttribute("data-generated-layer", svgLevel);
          pinPrickLayer.setAttribute("pointer-events", "none");

          parent.insertBefore(lightTouchLayer, originalPath.nextSibling);
          parent.insertBefore(pinPrickLayer, lightTouchLayer.nextSibling);
        });
      });
    });
  }, [exam, svgHtml]);

  return (
    <div
      ref={diagramRef}
      style={{
        width: "360px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}