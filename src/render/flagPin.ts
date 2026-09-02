import * as THREE from 'three';

// 3Dポールフラグの生成（金色のポール＋赤いペナント）
export function createFlagPinMesh(): THREE.Group {
  const group = new THREE.Group();

  const poleGeo = new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8);
  const poleMat = new THREE.MeshLambertMaterial({ color: 0xf59e0b });
  const pole = new THREE.Mesh(poleGeo, poleMat);
  pole.position.y = 0.25;
  group.add(pole);

  const flagGeo = new THREE.ConeGeometry(0.18, 0.32, 3);
  const flagMat = new THREE.MeshLambertMaterial({ color: 0xef4444 });
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.rotation.z = Math.PI / 2;
  flag.rotation.y = Math.PI / 2;
  flag.position.set(0.12, 0.36, 0);
  group.add(flag);

  group.position.y = 0.32;
  return group;
}
