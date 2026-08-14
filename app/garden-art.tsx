type ArtSize = "small" | "medium" | "large";

export function PlanterArt({ kind, size = "medium" }: { kind: "nursery" | "clay" | "ceramic" | "trough" | "moon"; size?: ArtSize }) {
  return (
    <span className={`art planter-art planter-${kind} art-${size}`} aria-hidden="true">
      <i className="planter-rim" />
      <i className="planter-body" />
      <i className="planter-soil" />
      <i className="planter-mark" />
    </span>
  );
}

export function PlantArt({ species, stage = 4, size = "medium" }: { species: "dandelion" | "lavender" | "clover" | "marigold" | "fern" | "orchid"; stage?: number; size?: ArtSize }) {
  return (
    <span className={`art plant-art plant-${species} stage-${stage} art-${size}`} aria-hidden="true">
      <i className="plant-stalk stalk-a"><b /><em /></i>
      <i className="plant-stalk stalk-b"><b /><em /></i>
      <i className="plant-stalk stalk-c"><b /><em /></i>
      <i className="plant-stalk stalk-d"><b /><em /></i>
      <i className="plant-stalk stalk-e"><b /><em /></i>
    </span>
  );
}

export function ToolArt({ kind, size = "medium" }: { kind: "watering-can" | "trowel" | "shears" | "gloves"; size?: ArtSize }) {
  return <span className={`art tool-art tool-${kind} art-${size}`} aria-hidden="true"><i /><b /><em /></span>;
}

export function BoostArt({ kind, size = "medium" }: { kind: "water" | "compost" | "moon-dew" | "root-tonic"; size?: ArtSize }) {
  return <span className={`art boost-art boost-${kind} art-${size}`} aria-hidden="true"><i /><b>✦</b></span>;
}
