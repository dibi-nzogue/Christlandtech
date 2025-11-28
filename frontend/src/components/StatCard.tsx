import { Users, Package, FileText, MessageSquare } from "lucide-react";

type StatCardProps = {
  icon: "users" | "package" | "file-text" | "message-square";
  label: string;
  value: string;
};

const icons = {
  users: <Users className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />,
  package: <Package className="w-5 h-5 md:w-6 md:h-6 text-green-500" />,
  "file-text": <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />,
  "message-square": (
    <MessageSquare className="w-5 h-5 md:w-6 md:h-6 text-pink-500" />
  ),
};

const StatCard = ({ icon, label, value }: StatCardProps) => {
  return (
    <div className="flex items-center gap-3 bg-white px-3 py-2 md:px-4 md:py-4 rounded-xl shadow-sm mt-2">
      {/* Icône compacte */}
      <div className="bg-blue-50 p-2 rounded-lg flex items-center justify-center">
        {icons[icon]}
      </div>

      {/* Textes plus petits sur mobile */}
      <div className="flex flex-col">
        <p className="text-[11px] md:text-sm text-gray-500">{label}</p>
        <h3 className="text-base md:text-xl font-semibold">{value}</h3>
      </div>
    </div>
  );
};

export default StatCard;
