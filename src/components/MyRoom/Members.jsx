
const Members = ({room}) =>{
  return (
    <div>
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            {room.members.map((member) => (
            <div
                key={member._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
            >
                {/* Avatar */}
                <div className="h-12 w-12 rounded-full bg-teal-600/20 flex items-center justify-center text-teal-700 dark:text-teal-300 font-semibold text-lg">
                {member.name ? member.name[0].toUpperCase() : "U"}
                </div>

                {/* Info */}
                <div className="flex-1">
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {member.name || "Unknown"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{member.email}</p>
                </div>

                {/* Action button */}
                <button className="px-3 py-1 text-xs rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors">
                    Message
                </button>
            </div>
            ))}
        </div>
    </div>

  );
}

export default Members;