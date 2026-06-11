// A simple spinning loader
function Loader() {
  return (
    <div className="flex items-center justify-center py-10">
      <div className="h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

export default Loader;
