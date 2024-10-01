const Breadcrumb = ({ pathHistory, currentPath, goToPath }) => {
   const fullPath = [...pathHistory];
  
    const currentPathName = currentPath.split(/[\/\\]/).pop() || '/';
  
    if (pathHistory.length === 0 || currentPathName !== pathHistory[pathHistory.length - 1].split(/[\/\\]/).pop()) {
      fullPath.push(currentPath);
    }
  
    return (
      <div style={{ marginBottom: "10px" }}>
        {fullPath.map((path, index) => {
          const displayName = path.split(/[\/\\]/).pop() || '/';
          
          return (
            <span key={index}>
              <span
                style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
                onClick={() => goToPath(path)}
              >
                {displayName} 
              </span>
              {index < fullPath.length - 1 && ' > '}
            </span>
          );
        })}
      </div>
    );
  };
  
  export default Breadcrumb;
  