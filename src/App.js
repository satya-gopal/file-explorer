import React, { useState, useEffect } from "react";
import axios from "axios";
import Breadcrumb from "./components/BreadCrumb";
import DeleteDialog from "./components/DeleteDialog";

function App() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState("/");
  const [pathHistory, setPathHistory] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletePath, setDeletePath] = useState("");
  const [loading, setLoading] = useState(false);

  const [selectedItemsToDisplay, setSelectedItemsToDisplay] = useState([]);

  console.log(files, "files");

  console.log(currentPath, "currentPath");
  console.log(pathHistory, "pathHistory");
  console.log(selectedItems, "selectedItems");
  console.log(selectedItemsToDisplay, "selectedItemsToDisplay");


  const fetchFiles = (path) => {
    axios
      .get(`http://127.0.0.1:5000/files?path=${path}`)
      .then((response) => setFiles(response.data))
      .catch((error) => console.error("Error fetchingx   files", error));
  };

  useEffect(() => {
    fetchFiles(currentPath);
  }, [currentPath]);

  useEffect(() => {
    const updatedSelectedItems = getSelectedItemsForDisplay();

    const filteredDisplayItems = selectedItemsToDisplay.filter((item) =>
      selectedItems.includes(item.path)
    );

    const newItems = updatedSelectedItems.filter(
      (item) =>
        !filteredDisplayItems.some(
          (existingItem) => existingItem.path === item.path
        )
    );

    setSelectedItemsToDisplay([...filteredDisplayItems, ...newItems]);
    getPartialSelectedItems();
  }, [selectedItems, files]);

  const openFolder = (path) => {
    const newPathHistory = [...pathHistory, currentPath].filter(
      (item, index, self) => self.indexOf(item) === index
    );
    setPathHistory(newPathHistory);
    setCurrentPath(path);
  };
  
  const goToPath = (path) => {
    const newPathHistory = pathHistory.slice(0, pathHistory.indexOf(path) + 1);
    setPathHistory(newPathHistory);
    setCurrentPath(path);
  };
  
  const goBack = () => {
    if (pathHistory.length > 0) {
      const previousPath = pathHistory[pathHistory.length - 1];
      const newPathHistory = pathHistory.slice(0, pathHistory.length - 1);
      setPathHistory(newPathHistory);
      setCurrentPath(previousPath);
    }
  };

  // useEffect(() => {
  //   if (selectedItems.length) {
  //     getPartialSelectedItems();
  //   }
  // }, [selectedItems]);

  console.log(selectedItemsToDisplay);
  const removeDuplicates = (arr) => {
    const uniqueArray = Array.from(new Set(arr.map(JSON.stringify))).map(
      JSON.parse
    );
    return uniqueArray;
  };

  function formatBytes(bytes) {
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 B";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const formattedSize = (bytes / Math.pow(1024, i)).toFixed(2);
    return `${formattedSize} ${sizes[i]}`;
  }

  const getPartialSelectedItems = () => {
    // const partialSelectedPaths = JSON.parse(JSON.stringify(selectedItems)).map(
    //   (item) => item.split("/").slice(0, -1).join("/")
    // );
    const partialSelectedPaths = JSON.parse(JSON.stringify(selectedItems)).map(
      (item) => item.replace(/\\/g, "/").split("/").slice(0, -1).join("/")
    );
    const uniquePartialSelectedPaths = [...new Set(partialSelectedPaths)];
    const obj = {
      isDirectory: true,
      status: "Partially Selected",
    };
    const finalPartialSelectedItems = uniquePartialSelectedPaths.map(
      (path) => ({
        ...obj,
        path,
        name: path.split("/").slice(-1)[0],
      })
    );
    setSelectedItemsToDisplay((prev) => {
      const totalItems = [...prev, ...finalPartialSelectedItems];
      const uniqueItems = removeDuplicates(totalItems);
      return uniqueItems;
    });
  };

  const handleSelection = (item) => {
    const alreadySelected = selectedItems.includes(item.path);

    if (alreadySelected) {
      // Deselect logic
      if (item.isDirectory) {
        const childItems = getChildItems(item.path);
        setSelectedItems(
          selectedItems.filter(
            (i) =>
              ![item.path, ...childItems.map((child) => child.path)].includes(i)
          )
        );
      } else {
        setSelectedItems(selectedItems.filter((i) => i !== item.path));
      }
    } else {
      if (item.isDirectory) {
        const childItems = getChildItems(item.path);
        const allChildItemsSelected = childItems.every((child) =>
          selectedItems.includes(child.path)
        );

        if (allChildItemsSelected) {
          setSelectedItems([
            ...selectedItems.filter(
              (i) => !childItems.map((child) => child.path).includes(i)
            ),
            item.path,
          ]);
        } else {
          setSelectedItems([
            ...selectedItems,
            item.path,
            ...childItems.map((child) => child.path),
          ]);
        }
      } else {
        setSelectedItems([...selectedItems, item.path]); // Add single item to selection
      }
    }
  };

  const getSelectedItemsForDisplay = () => {
    const displayItems = [];

    files.forEach((file) => {
      const status = determineSelectionStatus(file);
      if (status !== "Not Selected") {
        displayItems.push({
          path: file.path,
          status,
          name: file.name,
          size: file.size,
          dateModified: file.dateModified,
        });
      }
    });

    return displayItems;
  };

  const determineSelectionStatus = (file) => {
    if (file.isDirectory) {
      const itemsInFolder = getChildItems(file.path);

      const allItemsSelected = itemsInFolder.every((item) =>
        selectedItems.includes(item.path)
      );

      const someItemsSelected = itemsInFolder.some((item) =>
        selectedItems.includes(item.path)
      );

      const pathSegments = currentPath.split(/\/|\\/); // Split based on '/' or '\'
      const filePathSegments = file.path.split(/\/|\\/); // Split the file path similarly

      const isPartOfCurrentPath = pathSegments.every(
        (segment, index) => filePathSegments[index] === segment
      );

      if (selectedItems.includes(file.path) && allItemsSelected) {
        return "Fully Selected";
      } else if (someItemsSelected) {
        return "Partially Selected";
      }

      return "Not Selected";
    }

    return selectedItems.includes(file.path)
      ? "Fully Selected"
      : "Not Selected";
  };

  const getChildItems = (folderPath) => {
    return files.filter(
      (file) => file.path.startsWith(folderPath) && file.path !== folderPath
    );
  };

  const deleteSelectedItems = () => {
    const promises = selectedItems.map((item) =>
      axios.post("http://127.0.0.1:5000/delete", { path: item })
    );

    Promise.all(promises) 
      .then(() => {
        setSelectedItems([]);
        fetchFiles(currentPath);
      })
      .catch((error) => console.error("Error deleting items", error));
  };

  const handleDelete = (itemPath) => {
    setDeleteDialogOpen(true)
    setDeletePath(itemPath)
    
  }

  const deleteFromDivision2 = () => {
    setLoading(true)
    axios
      .post("http://127.0.0.1:5000/delete", { path: deletePath })
      .then(() => {
        setSelectedItems(selectedItems.filter((item) => item !== deletePath));
        fetchFiles(currentPath);
        setLoading(false)
        setDeleteDialogOpen(false)
      })
      .catch((error) => console.error("Error deleting item", error));
  };

  const deleteAllFromDivision2 = () => {
    console.log(selectedItems,"itemPath");
    axios
      .post("http://127.0.0.1:5000/delete_all", {
        paths: selectedItems,
      })
      .then(() => {
        setSelectedItems([]);
        fetchFiles(currentPath);
      })
      .catch((error) => console.error("Error deleting items", error));
  };

  const sortedFiles = [...files].sort((a, b) => {
    if (a.isDirectory === b.isDirectory) {
      return a.name.localeCompare(b.name);
    }
    return a.isDirectory ? -1 : 1;
  });

  return (
    <div className="App" style={{ padding: "10px" }}>
      <h2>Division 1 - File Explorer</h2>

      <Breadcrumb
        pathHistory={pathHistory}
        currentPath={currentPath}
        goToPath={goToPath}
      />

      <div>
        <b>Current Path:</b> {currentPath}
        {pathHistory.length > 0 && (
          <button onClick={goBack} style={{ marginLeft: "10px" }}>
            Back
          </button>
        )}
      </div>

      <table
        style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}
      >
        <thead>
          <tr>
            <th
              style={{
                borderBottom: "1px solid black",
                textAlign: "left",
                padding: "5px",
              }}
            >
              Select
            </th>
            <th
              style={{
                borderBottom: "1px solid black",
                textAlign: "left",
                padding: "5px",
              }}
            >
              File/Folder Name
            </th>
            <th
              style={{
                borderBottom: "1px solid black",
                textAlign: "left",
                padding: "5px",
              }}
            >
              Size
            </th>
            <th
              style={{
                borderBottom: "1px solid black",
                textAlign: "left",
                padding: "5px",
              }}
            >
              Date Modified
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedFiles.map((file) => (
            <tr key={file.path}>
              <td style={{ padding: "5px" }}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(file.path)}
                  onChange={() => handleSelection(file)}
                />
              </td>
              <td style={{ padding: "5px" }}>
                {file.isDirectory ? (
                  <span
                    onClick={() => openFolder(file.path)}
                    style={{
                      cursor: "pointer",
                      color: "blue",
                      textDecoration: "underline",
                    }}
                  >
                    📁 {file.name}
                  </span>
                ) : (
                  <>📄 {file.name}</>
                )}
              </td>
              <td style={{ padding: "5px" }}>
                {file.size ? formatBytes(file.size) : "--"}
              </td>
              <td style={{ padding: "5px" }}>{file.dateModified || "--"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Division 2 - Selected Items */}
      <div style={{ marginTop: "30px" }}>
        <div style={{ display: "flex" }}>
          <h2>Division 2 - Selected Items</h2>
          <button
            onClick={deleteAllFromDivision2}
            style={{
              marginTop: "20px",
              backgroundColor: "red",
              color: "white",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            Delete All Selected
          </button>
        </div>
        {selectedItemsToDisplay.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    borderBottom: "1px solid black",
                    textAlign: "left",
                    padding: "5px",
                  }}
                >
                  Select
                </th>
                <th
                  style={{
                    borderBottom: "1px solid black",
                    textAlign: "left",
                    padding: "5px",
                  }}
                >
                  File/Folder Name
                </th>
                <th
                  style={{
                    borderBottom: "1px solid black",
                    textAlign: "left",
                    padding: "5px",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    borderBottom: "1px solid black",
                    textAlign: "left",
                    padding: "5px",
                  }}
                >
                  Size
                </th>
                <th
                  style={{
                    borderBottom: "1px solid black",
                    textAlign: "left",
                    padding: "5px",
                  }}
                >
                  Date Modified
                </th>
                <th
                  style={{
                    borderBottom: "1px solid black",
                    textAlign: "left",
                    padding: "5px",
                  }}
                >
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedItemsToDisplay.map((item) => (
                <tr key={item.path}>
                  <td style={{ padding: "5px" }}>
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.path)}
                      onChange={() => handleSelection(item)}
                    />
                  </td>
                  <td style={{ padding: "5px" }}>{item.name}</td>
                  <td style={{ padding: "5px" }}>{item.status}</td>
                  <td style={{ padding: "5px" }}>
                    {item.size ? formatBytes(item.size) : "--"}
                  </td>
                  <td style={{ padding: "5px" }}>{item.dateModified || "--"}</td>
                  <td style={{ padding: "5px" }}>
                    {item.status === "Partially Selected" ? "" :
                    (<button 
                      onClick={() => handleDelete(item.path)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No items selected.</p>
        )}
      </div>
      <DeleteDialog
        openOrNot={deleteDialogOpen}
        onCancelClick={() => setDeleteDialogOpen(false)}
        label="Are you sure you want to delete this file or folder?"
        onOKClick={deleteAllFromDivision2}
        deleteLoading={loading}
      />
    </div>
  );
}

export default App;
