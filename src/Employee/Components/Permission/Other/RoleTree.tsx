import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  Edge,
  Connection,
  useEdgesState,
  useNodesState,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

// Define the Role interface
interface Role {
  RoleId: number;
  RoleName: string;
  RolePriority: number;
}

// Define the component
const RoleTree: React.FC = () => {
  // Define the state for nodes and edges, using types Node[] and Edge[] respectively
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  useEffect(() => {
    axios.get("/Permission/GET/GetAllRoles").then((res) => {
      const roles: Role[] = res.data.sort(
        (a: Role, b: Role) => a.RolePriority - b.RolePriority
      );

      // Group roles by their priority
      const groupedRoles: { [key: number]: Role[] } = {};
      roles.forEach((role) => {
        if (!groupedRoles[role.RolePriority])
          groupedRoles[role.RolePriority] = [];
        groupedRoles[role.RolePriority].push(role);
      });

      // Arrays to hold nodes and edges
      const roleNodes: Node[] = [];
      const roleEdges: Edge[] = [];
      const priorityKeys = Object.keys(groupedRoles);

      priorityKeys.slice(0, -1).forEach((priority, priorityIndex) => {
        const roles = groupedRoles[parseInt(priority)];
        const yPosition = priorityIndex * 200;
        const collectionNodeId = `collection-${priority}`;

        roleNodes.push({
          id: collectionNodeId,
          position: { x: 65, y: yPosition + 100 },
          style: {
            width: 20,
            height: 20,
            backgroundColor: "white",
            borderRadius: 5,
            border: "1px solid black",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "black",
            fontSize: "8px",
            textAlign: "center",
          },
          data: { label: "" }, // Adding a label property to meet Node type requirements
        });

        roles.forEach((role, roleIndex) => {
          const roleXPosition = (roleIndex - (roles.length - 1) / 2) * 200;
          roleNodes.push({
            id: `role-${role.RoleId}`,
            data: { label: role.RoleName },
            position: { x: roleXPosition, y: yPosition },
          });

          roleEdges.push({
            id: `e-${role.RoleId}-to-${collectionNodeId}`,
            source: `role-${role.RoleId}`,
            target: collectionNodeId,
            type: "default",
            animated: false,
          });
        });

        const nextPriority = priorityKeys[priorityIndex + 1];
        const nextRoles = groupedRoles[parseInt(nextPriority)];

        nextRoles.forEach((nextRole) => {
          roleEdges.push({
            id: `e-${collectionNodeId}-to-${nextRole.RoleId}`,
            source: collectionNodeId,
            target: `role-${nextRole.RoleId}`,
            type: "default",
            animated: false,
          });
        });
      });

      // Handling the last priority group
      const lastPriority = priorityKeys[priorityKeys.length - 1];
      const lastRoles = groupedRoles[parseInt(lastPriority)];
      const lastYPosition = (priorityKeys.length - 1) * 200;

      lastRoles.forEach((role) => {
        const roleXPosition =
          (lastRoles.indexOf(role) - (lastRoles.length - 1) / 2) * 200;
        roleNodes.push({
          id: `role-${role.RoleId}`,
          data: { label: role.RoleName },
          position: { x: roleXPosition, y: lastYPosition },
        });

        roleEdges.push({
          id: `e-${role.RoleId}-to-last-collection`,
          source: `role-${role.RoleId}`,
          target: `collection-${lastPriority}`,
          type: "default",
          animated: false,
        });
      });

      // Set the nodes and edges
      setNodes(roleNodes);
      setEdges(roleEdges);
    });
  }, [setNodes, setEdges]);

  // Handle new edge connections
  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ height: 500 }} className="mt-5 border border-gray rounded-lg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
};

export default RoleTree;
