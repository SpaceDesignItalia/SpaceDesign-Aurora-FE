import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  Edge,
  Connection,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";

interface Role {
  RoleId: number;
  RoleName: string;
  RolePriority: number;
}

const RoleTree = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    axios.get("/Permission/GET/GetAllRoles").then((res) => {
      const roles: Role[] = res.data.sort(
        (a, b) => a.RolePriority - b.RolePriority
      );
      const groupedRoles: { [key: number]: Role[] } = {};

      roles.forEach((role) => {
        if (!groupedRoles[role.RolePriority])
          groupedRoles[role.RolePriority] = [];
        groupedRoles[role.RolePriority].push(role);
      });

      const roleNodes = [];
      const roleEdges: Edge[] = [];
      const priorityKeys = Object.keys(groupedRoles);

      priorityKeys.slice(0, -1).forEach((priority, priorityIndex) => {
        const roles = groupedRoles[priority];
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
        const nextRoles = groupedRoles[nextPriority];

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

      const lastPriority = priorityKeys[priorityKeys.length - 1];
      const lastRoles = groupedRoles[lastPriority];
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

      setNodes(roleNodes);
      setEdges(roleEdges);
    });
  }, []);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    []
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
