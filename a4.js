import { Mat4 } from './math.js';
import { Parser } from './parser.js';
import { Scene } from './scene.js';
import { Renderer } from './renderer.js';
import { TriangleMesh } from './trianglemesh.js';
// DO NOT CHANGE ANYTHING ABOVE HERE

////////////////////////////////////////////////////////////////////////////////
// TODO: Implement createCube, createSphere, computeTransformation, and shaders
////////////////////////////////////////////////////////////////////////////////

// Example two triangle quad
const quad = {
  positions: [-1, -1, -1, 1, -1, -1, 1, 1, -1, -1, -1, -1, 1,  1, -1, -1,  1, -1],
  normals: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
  uvCoords: [0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1]
}

TriangleMesh.prototype.createCube = function() {
    this.positions = [];
    this.normals = [];
    this.uvCoords = [];
    
    const s = 1; //scale factor

    const faces = [
        // front (+Z)
        {normal: [0,0,1], verts:[[-s,-s,s],[s,-s,s],[s,s,s],[-s,s,s]], uv:[ [0,0],[0.5,0],[0.5,0.333],[0,0.333] ]}, 
        // back (-Z)
        {normal: [0,0,-1], verts:[[s,-s,-s],[-s,-s,-s],[-s,s,-s],[s,s,-s]], uv:[[0.5,0.667],[1,0.667],[1,1],[0.5,1]]},
        // left (-X)
        {normal: [-1,0,0], verts:[[-s,-s,-s],[-s,-s,s],[-s,s,s],[-s,s,-s]], uv:[[0,0.667],[0.5,0.667],[0.5,1],[0,1]]},
        // right (+X)
        {normal: [1,0,0], verts:[[s,-s,s],[s,-s,-s],[s,s,-s],[s,s,s]], uv:[[0.5,0],[1,0],[1,0.333],[0.5,0.333]]},
        // top (+Y)
        {normal: [0,1,0], verts:[[-s,s,s],[s,s,s],[s,s,-s],[-s,s,-s]], uv:[[0,0.333],[0.5,0.333],[0.5,0.667],[0,0.667]]},
        // bottom (-Y)
        {normal: [0,-1,0], verts:[[-s,-s,-s],[s,-s,-s],[s,-s,s],[-s,-s,s]], uv:[[0.5,0.333],[1,0.333],[1,0.667],[0.5,0.667]]}
    ];

    for (let f of faces) {
        const v = f.verts, n = f.normal, uv = f.uv;
        // 2 triangles per face
        const tris = [ [0,1,2], [0,2,3] ];
        for (let t of tris) {
            for (let i of t) {
                this.positions.push(...v[i]);
                this.normals.push(...n);
                this.uvCoords.push(...uv[i]);
            }
        }
    }
}


TriangleMesh.prototype.createSphere = function(stacks = 20, slices = 20) {
  this.positions = [];
  this.normals = [];
  this.uvCoords = [];
  this.indices = [];

  for(let i=0; i<stacks; i++){
    const phi1 = i * Math.PI / stacks;
    const phi2 = (i+1) * Math.PI / stacks;
    for(let j=0; j<slices; j++){
      const theta1 = j * 2 * Math.PI / slices;
      const theta2 = (j+1) * 2 * Math.PI / slices;

      const x11 = Math.sin(phi1)*Math.cos(theta1), y11=Math.cos(phi1), z11=Math.sin(phi1)*Math.sin(theta1);
      const x12 = Math.sin(phi1)*Math.cos(theta2), y12=Math.cos(phi1), z12=Math.sin(phi1)*Math.sin(theta2);
      const x21 = Math.sin(phi2)*Math.cos(theta1), y21=Math.cos(phi2), z21=Math.sin(phi2)*Math.sin(theta1);
      const x22 = Math.sin(phi2)*Math.cos(theta2), y22=Math.cos(phi2), z22=Math.sin(phi2)*Math.sin(theta2);

      this.positions.push(x11,y11,z11, x21,y21,z21, x22,y22,z22, x11,y11,z11, x22,y22,z22, x12,y12,z12);
      this.normals.push(x11,y11,z11, x21,y21,z21, x22,y22,z22, x11,y11,z11, x22,y22,z22, x12,y12,z12);
      this.uvCoords.push(j/slices,i/stacks,j/slices,(i+1)/stacks,(j+1)/slices,(i+1)/stacks,j/slices,i/stacks,(j+1)/slices,(i+1)/stacks,(j+1)/slices,i/stacks);
    }
  }
};

Scene.prototype.computeTransformation = function(transformSequence) {
  let overallTransform = Mat4.create();

  const createTranslationMat = (x, y, z) => {
    let T = Mat4.create();

    T[12] = x; T[13] = y; T[14] = z;
    return T;
  };
  
  // Helper function to create a 4x4 Scale Matrix
  // Needed the helper function to fix rotation transform !
  const createScaleMat = (x, y, z) => {
    let S = Mat4.create();
    S[0] = x; S[5] = y; S[10] = z;
    return S;
  };
  
  // Helper function to create a 4x4 Rotation Matrix
  const createRotationMat = (axis, thetaDeg) => {
    const thetaRad = thetaDeg * Math.PI / 180.0;
    const c = Math.cos(thetaRad);
    const s = Math.sin(thetaRad);
    let R = Mat4.create(); 

    switch (axis) {
      case 'x':
        R[5] = c; R[6] = s;  
        R[9] = -s; R[10] = c; 
        break;
      case 'y':
        R[0] = c; R[2] = -s;  
        R[8] = s; R[10] = c; 
        break;
      case 'z':
        R[0] = c; R[1] = s; 
        R[4] = -s; R[5] = c;
        break;
    }
    return R;
  };


  for (const transform of transformSequence) {
    const type = transform[0];
    const x = transform[1];
    const y = transform.length > 2 ? transform[2] : 0;
    const z = transform.length > 3 ? transform[3] : 0;
    
    let M; 

    switch (type) {
      case 'T': 
        M = createTranslationMat(x, y, z);
        break;
      case 'S':
        M = createScaleMat(x, y, z);
        break;
      case 'Rx':
      case 'Ry':
      case 'Rz':
        const axis = type.toLowerCase().substring(1);
        M = createRotationMat(axis, x); 
        break;
    }

    if (M) {
      let newTransform = Mat4.create();
      Mat4.multiply(newTransform, M, overallTransform);
      overallTransform = newTransform;
    }
  }

  return overallTransform;
}



Renderer.prototype.VERTEX_SHADER = `
precision mediump float;
attribute vec3 position, normal;
attribute vec2 uvCoord;
uniform vec3 lightPosition; // Light in World Space
uniform mat4 projectionMatrix, viewMatrix, modelMatrix;
uniform mat3 normalMatrix;

varying vec2 vTexCoord;

varying vec3 vNormal;   // Surface Normal in View Space
varying vec3 vLightDir; // Light Direction in View Space
varying vec3 vViewPos;  // Vertex Position in View Space

void main() {
  vTexCoord = uvCoord;

  vec4 modelViewPos = viewMatrix * modelMatrix * vec4(position, 1.0);
  vViewPos = modelViewPos.xyz; 

  vNormal = normalMatrix * normal;

  vec4 viewLightPos = viewMatrix * vec4(lightPosition, 1.0);
  
  vLightDir = viewLightPos.xyz - vViewPos;

  gl_Position = projectionMatrix * modelViewPos;
}
`;

Renderer.prototype.FRAGMENT_SHADER = `
precision mediump float;
uniform vec3 ka, kd, ks, lightIntensity;
uniform float shininess;
uniform sampler2D uTexture;
uniform bool hasTexture;
varying vec2 vTexCoord;

varying vec3 vNormal;
varying vec3 vLightDir;
varying vec3 vViewPos; 

void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(vLightDir);
  vec3 V = normalize(-vViewPos); 

  vec3 ambient = ka * lightIntensity;

  float NdotL = max(dot(N, L), 0.0);
  vec3 diffuse = kd * lightIntensity * NdotL;

  vec3 H = normalize(L + V); // Halfway vector
  float NdotH = max(dot(N, H), 0.0);
  
  float specularTerm = pow(NdotH, shininess);
  vec3 specular = ks * lightIntensity * specularTerm;

  vec3 shadedColor = ambient + diffuse + specular;
  
  // 4. Texturing (Modulation)
  if (hasTexture) {
    vec4 textureColor = texture2D(uTexture, vTexCoord);
    gl_FragColor = vec4(shadedColor * textureColor.rgb, 1.0);
  } else {
    gl_FragColor = vec4(shadedColor, 1.0);
  }
}
`;

////////////////////////////////////////////////////////////////////////////////
// EXTRA CREDIT: change DEF_INPUT to create something interesting!
////////////////////////////////////////////////////////////////////////////////
const DEF_INPUT = [
  "c,myCamera,perspective,5,5,5,0,0,0,0,1,0;",
  "l,myLight,point,0,5,0,2,2,2;",
  "p,unitCube,cube;",
  "p,unitSphere,sphere,20,20;",
  "m,redDiceMat,0.3,0,0,0.7,0,0,1,1,1,15,dice.jpg;",
  "m,grnDiceMat,0,0.3,0,0,0.7,0,1,1,1,15,dice.jpg;",
  "m,bluDiceMat,0,0,0.3,0,0,0.7,1,1,1,15,dice.jpg;",
  "m,globeMat,0.3,0.3,0.3,0.7,0.7,0.7,1,1,1,5,globe.jpg;",
  "o,rd,unitCube,redDiceMat;",
  "o,gd,unitCube,grnDiceMat;",
  "o,bd,unitCube,bluDiceMat;",
  "o,gl,unitSphere,globeMat;",
  "X,rd,Rz,75;X,rd,Rx,90;X,rd,S,0.5,0.5,0.5;X,rd,T,-1,0,2;",
  "X,gd,Ry,45;X,gd,S,0.5,0.5,0.5;X,gd,T,2,0,2;",
  "X,bd,S,0.5,0.5,0.5;X,bd,Rx,90;X,bd,T,2,0,-1;",
  "X,gl,S,1.5,1.5,1.5;X,gl,Rx,90;X,gl,Ry,-150;X,gl,T,0,1.5,0;",
].join("\n");

// DO NOT CHANGE ANYTHING BELOW HERE
export { Parser, Scene, Renderer, DEF_INPUT };
