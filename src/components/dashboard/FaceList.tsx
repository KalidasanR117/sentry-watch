import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { User, Shield, Ban, MoreVertical } from "lucide-react";

interface FaceEntry {
  id: string;
  name: string;
  status: "whitelist" | "blacklist";
  lastSeen?: string;
  imageUrl?: string;
}

interface FaceListProps {
  faces: FaceEntry[];
  onSelect?: (face: FaceEntry) => void;
  onEdit?: (face: FaceEntry) => void;
  onDelete?: (face: FaceEntry) => void;
}


export function FaceList({ faces, onSelect, onEdit, onDelete }: FaceListProps) {
  const whitelisted = faces.filter(
  f => f.status === "whitelist" || f.status === "unknown"
);

  const blacklisted = faces.filter(f => f.status === "blacklist");
  
  return (
    <div className="space-y-6">
      {/* Blacklist Section */}
      {blacklisted.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Ban className="w-4 h-4 text-critical" />
            <h4 className="text-sm font-medium text-critical">Blacklist ({blacklisted.length})</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {blacklisted.map((face, index) => (
              <FaceCard
  key={face.id}
  face={face}
  index={index}
  onClick={() => onSelect?.(face)}
  onEdit={() => onEdit?.(face)}
  onDelete={() => onDelete?.(face)}
/>

            ))}
          </div>
        </div>
      )}
      
      {/* Whitelist Section */}
      {whitelisted.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-low" />
            <h4 className="text-sm font-medium text-low">Whitelist ({whitelisted.length})</h4>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {whitelisted.map((face, index) => (
              <FaceCard
  key={face.id}
  face={face}
  index={index}
  onClick={() => onSelect?.(face)}
  onEdit={() => onEdit?.(face)}
  onDelete={() => onDelete?.(face)}
/>

            ))}
          </div>
        </div>
      )}
      
      {faces.length === 0 && (
        <div className="text-center py-8">
          <User className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No faces in database</p>
        </div>
      )}
    </div>
  );
}

function FaceCard({
  face,
  index,
  onClick,
  onEdit,
  onDelete,
}: {
  face: FaceEntry;
  index: number;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
      className={cn(
        "group relative p-3 rounded-lg border cursor-pointer",
        "bg-card/50 backdrop-blur-sm transition-all duration-200",
        face.status === "blacklist" && "border-critical/30 hover:border-critical/50",
        face.status === "whitelist" && "border-low/30 hover:border-low/50"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center",
        face.status === "blacklist" && "bg-critical/10",
        face.status === "whitelist" && "bg-low/10"
      )}>
        {face.imageUrl ? (
          <img src={face.imageUrl} alt={face.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <User className={cn(
            "w-6 h-6",
            face.status === "blacklist" && "text-critical",
            face.status === "whitelist" && "text-low"
          )} />
        )}
      </div>
      
      {/* Name */}
      <p className="text-sm font-medium text-center truncate">{face.name}</p>
      
      {/* Last seen */}
      {face.lastSeen && (
        <p className="text-xs text-muted-foreground text-center mt-1 font-mono">
          {face.lastSeen}
        </p>
      )}
      
      {/* Status indicator */}
      <div className={cn(
        "absolute top-2 right-2 w-2 h-2 rounded-full",
        face.status === "blacklist" && "bg-critical",
        face.status === "whitelist" && "bg-low"
      )} />
      
      {/* Menu button */}
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
  <div className="relative">
    <button className="p-1 rounded hover:bg-secondary/50">
      <MoreVertical className="w-3 h-3 text-muted-foreground" />
    </button>

    <div className="absolute left-0 mt-1 w-24 bg-card border border-border rounded-lg shadow-lg z-10">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit?.();
        }}
        className="w-full px-3 py-2 text-left text-xs hover:bg-secondary"
      >
        Edit
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete?.();
        }}
        className="w-full px-3 py-2 text-left text-xs text-critical hover:bg-critical/10"
      >
        Delete
      </button>
    </div>
  </div>
</div>


    </motion.div>
  );
}
