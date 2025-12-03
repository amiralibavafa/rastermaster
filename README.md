# RasterMaster 361

![Rendered Output](output.png)

**Rasterizing Lines and Triangles** 💡

RasterMaster 361 is a **WebGL-based project** where you implement shading, texturing, and transformations for triangle meshes. The project allows you to render cubes and spheres, apply **Phong shading**, add textures, and transform your 3D objects with a flexible text input interface.

---

## Features

* Generate **unit cubes** and **unit spheres** as triangle meshes.
* Apply **Phong shading** (ambient, diffuse, specular components).
* Support **texturing** (`dice.jpg`, `globe.jpg`).
* Apply **transformations**: translation, rotation, and scale.
* Interactive **text input box**: define your own primitives, materials, objects, lights, and camera configurations.

> Type anything you want in the input box to create custom 3D scenes!

---

# Getting started
To run and develop this assignment you must start a local HTTP server in the directory containing `a4.html`.
The simplest way is using python.
In MacOS and Linux `python3 -m http.server` in a terminal should work out of the box.
For Windows or in case of any trouble, see these instructions: [https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server#running_a_simple_local_http_server](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server#running_a_simple_local_http_server).
You may also use an IDE that can run a simple HTTP server for your workspace (e.g., the "Go Live" mode in VS Code, or similar functionality with IntelliJ).
Once the HTTP server is up, navigate your browser to [http://localhost:8000/a4.html](http://localhost:8000/a4.html).

# Implementation instructions

Like the previous assignment, we use text input to specify what to render.
We use the following syntax:
- `p,id,cube;` creates a unit cube mesh and gives it the name `id`
- `p,id,sphere,i,j`	creates a unit sphere mesh with name `id`, formed using `i` "stacks", and `j` "sectors"
- `m,id,ka,kd,ks,shininess,texture;` creates a Phong shader material named by `id`, with ambient (`ka`), diffuse (`kd`), specular (`ks`), and specular exponent (`shininess`) coefficients, and an optional texture image specified by `texture`.
- `X,id,T,x,y,z;` specifies a transformation that translates object `id` by `(x,y,z)`.
- `X,id,R?,theta;` specifies a rotation of object `id` around axis `?` (i.e. `Rx` rotates around `x` etc.), by counter-clockwise angle in degrees `theta`.
- `X,id,S,x,y,z;` specifies a scale transformation of object `id` by scale factors `(x,y,z)` along each axis.
- `o,id,prim,mat;` adds an object to the scene with name `id`. The object uses the primitive mesh with id matching `prim` and the Phong shader material with id matching `mat`. Note this is the way to actually add an object into the scene (i.e. primitives and materials are not part of the scene until they are used by an object).
- `l,id,type,x,y,z,ir,ig,ib;` sets the light (with name `id`) and light type `type` at position `(x,y,z)` with intensity `(ir,ig,ib)`. We only support a single light of type `point`.
- `c,id,type,ex,ey,ez,lx,ly,lz,ux,uy,uz;` sets the camera to be placed at position `(ex,ey,ez)` and looking towards `(lx,ly,lz)` with up axis `(ux,uy,uz)`. We only support a single camera of type `perspective`.

You can change the contents of the text box to define new primitives, materials, and objects that use them, as well as to change the light and camera parameters.
Clicking the updtae button will refresh everything.
