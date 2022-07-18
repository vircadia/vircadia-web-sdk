//
//  EntityPropertyFlags.ts
//
//  Created by Julien Merzoug on 11 Jul 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/*@devdoc
 *  The <code>EntityPropertyFlags</code> namespace provides the positions of the flags in {@link PropertyFlags}.
 *  <table>
 *      <thead>
 *          <tr><th>Name</th><th>Value</th><th>Description</th></tr>
 *      </thead>
 *      <tbody>
 *          <tr><td>PROP_PAGED_PROPERTY</td><td>0</td><td>Paged property flag.</td></tr>
 *          <tr><td>PROP_CUSTOM_PROPERTIES_INCLUDED</td><td>1</td><td>Custom properties included flag.</td></tr>
 *          <tr><td>PROP_SIMULATION_OWNER</td><td>2</td><td>Simulation owner flag.</td></tr>
 *          <tr><td>PROP_PARENT_ID</td><td>3</td><td>Parent id flag.</td></tr>
 *          <tr><td>PROP_PARENT_JOINT_INDEX</td><td>4</td><td>Parent joint index flag.</td></tr>
 *          <tr><td>PROP_VISIBLE</td><td>5</td><td>Visible flag.</td></tr>
 *          <tr><td>PROP_NAME</td><td>6</td><td>Name flag.</td></tr>
 *          <tr><td>PROP_LOCKED</td><td>7</td><td>Locked flag.</td></tr>
 *          <tr><td>PROP_USER_DATA</td><td>8</td><td>User data flag.</td></tr>
 *          <tr><td>PROP_PRIVATE_USER_DATA</td><td>9</td><td>Private user data flag.</td></tr>
 *          <tr><td>PROP_HREF</td><td>10</td><td>Href flag.</td></tr>
 *          <tr><td>PROP_DESCRIPTION</td><td>11</td><td>Description flag.</td></tr>
 *          <tr><td>PROP_POSITION</td><td>12</td><td>Position flag.</td></tr>
 *          <tr><td>PROP_DIMENSIONS</td><td>13</td><td>Dimensions flag.</td></tr>
 *          <tr><td>PROP_ROTATION</td><td>14</td><td>Rotation flag.</td></tr>
 *          <tr><td>PROP_REGISTRATION_POINT</td><td>15</td><td>Registration point flag.</td></tr>
 *          <tr><td>PROP_CREATED</td><td>16</td><td>Created flag.</td></tr>
 *          <tr><td>PROP_LAST_EDITED_BY</td><td>17</td><td>Last edited by flag.</td></tr>
 *          <tr><td>PROP_ENTITY_HOST_TYPE</td><td>18</td><td>Entity host type flag.</td></tr>
 *          <tr><td>PROP_OWNING_AVATAR_ID</td><td>19</td><td>Owning avatar id flag.</td></tr>
 *          <tr><td>PROP_QUERY_AA_CUBE</td><td>20</td><td>Query aa cube flag.</td></tr>
 *          <tr><td>PROP_CAN_CAST_SHADOW</td><td>21</td><td>Can cast shadow flag.</td></tr>
 *          <tr><td>PROP_VISIBLE_IN_SECONDARY_CAMERA</td><td>22</td><td>Visible in secondary camera flag.</td></tr>
 *          <tr><td>PROP_RENDER_LAYER</td><td>23</td><td>Render layer flag.</td></tr>
 *          <tr><td>PROP_PRIMITIVE_MODE</td><td>24</td><td>Primitive mode flag.</td></tr>
 *          <tr><td>PROP_IGNORE_PICK_INTERSECTION</td><td>25</td><td>Ignore pick intersection flag.</td></tr>
 *          <tr><td>PROP_RENDER_WITH_ZONES</td><td>26</td><td>Render with zones flag.</td></tr>
 *          <tr><td>PROP_BILLBOARD_MODE</td><td>27</td><td>Billboard mode flag.</td></tr>
 *          <tr><td>PROP_GRAB_GRABBABLE</td><td>28</td><td>Grab grabbable flag.</td></tr>
 *          <tr><td>PROP_GRAB_KINEMATIC</td><td>29</td><td>Grab kinematic flag.</td></tr>
 *          <tr><td>PROP_GRAB_FOLLOWS_CONTROLLER</td><td>30</td><td>Grab follows controller flag.</td></tr>
 *          <tr><td>PROP_GRAB_TRIGGERABLE</td><td>31</td><td>Grab triggerable flag.</td></tr>
 *          <tr><td>PROP_GRAB_EQUIPPABLE</td><td>32</td><td>Grab equippable flag.</td></tr>
 *          <tr><td>PROP_GRAB_DELEGATE_TO_PARENT</td><td>33</td><td>Grab delegate to parent flag.</td></tr>
 *          <tr><td>PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET</td><td>34</td><td>Grab left equippable position offset flag.</td>
 *          </tr>
 *          <tr><td>PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET</td><td>35</td><td>Grab left equippable rotation offset flag.</td>
 *          </tr>
 *          <tr><td>PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET</td><td>36</td><td>Grab right equippable position offset flag.
 *          </td></tr>
 *          <tr><td>PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET</td><td>37</td><td>Grab right equippable rotation offset flag.
 *          </td></tr>
 *          <tr><td>PROP_GRAB_EQUIPPABLE_INDICATOR_URL</td><td>38</td><td>Grab equippable indicator url flag.</td></tr>
 *          <tr><td>PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE</td><td>39</td><td>Grab equippable indicator scale flag.</td></tr>
 *          <tr><td>PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET</td><td>40</td><td>Grab equippable indicator offset flag.</td></tr>
 *          <tr><td>PROP_DENSITY</td><td>41</td><td>Density flag.</td></tr>
 *          <tr><td>PROP_VELOCITY</td><td>42</td><td>Velocity flag.</td></tr>
 *          <tr><td>PROP_ANGULAR_VELOCITY</td><td>43</td><td>Angular velocity flag.</td></tr>
 *          <tr><td>PROP_GRAVITY</td><td>44</td><td>Gravity flag.</td></tr>
 *          <tr><td>PROP_ACCELERATION</td><td>45</td><td>Acceleration flag.</td></tr>
 *          <tr><td>PROP_DAMPING</td><td>46</td><td>Damping flag.</td></tr>
 *          <tr><td>PROP_ANGULAR_DAMPING</td><td>47</td><td>Angular damping flag.</td></tr>
 *          <tr><td>PROP_RESTITUTION</td><td>48</td><td>Restitution flag.</td></tr>
 *          <tr><td>PROP_FRICTION</td><td>49</td><td>Friction flag.</td></tr>
 *          <tr><td>PROP_LIFETIME</td><td>50</td><td>Lifetime flag.</td></tr>
 *          <tr><td>PROP_COLLISIONLESS</td><td>51</td><td>Collisionless flag.</td></tr>
 *          <tr><td>PROP_COLLISION_MASK</td><td>52</td><td>Collision mask flag.</td></tr>
 *          <tr><td>PROP_DYNAMIC</td><td>53</td><td>Dynamic flag.</td></tr>
 *          <tr><td>PROP_COLLISION_SOUND_URL</td><td>54</td><td>Collision sound url flag.</td></tr>
 *          <tr><td>PROP_ACTION_DATA</td><td>55</td><td>Action data flag.</td></tr>
 *          <tr><td>PROP_CLONEABLE</td><td>56</td><td>Cloneable flag.</td></tr>
 *          <tr><td>PROP_CLONE_LIFETIME</td><td>57</td><td>Clone lifetime flag.</td></tr>
 *          <tr><td>PROP_CLONE_LIMIT</td><td>58</td><td>Clone limit flag.</td></tr>
 *          <tr><td>PROP_CLONE_DYNAMIC</td><td>59</td><td>Clone dynamic flag.</td></tr>
 *          <tr><td>PROP_CLONE_AVATAR_ENTITY</td><td>60</td><td>Clone avatar entity flag.</td></tr>
 *          <tr><td>PROP_CLONE_ORIGIN_ID</td><td>61</td><td>Clone origin id flag.</td></tr>
 *          <tr><td>PROP_SCRIPT</td><td>62</td><td>Script flag.</td></tr>
 *          <tr><td>PROP_SCRIPT_TIMESTAMP</td><td>63</td><td>Script timestamp flag.</td></tr>
 *          <tr><td>PROP_SERVER_SCRIPTS</td><td>64</td><td>Server scripts flag.</td></tr>
 *          <tr><td>PROP_ITEM_NAME</td><td>65</td><td>Item name flag.</td></tr>
 *          <tr><td>PROP_ITEM_DESCRIPTION</td><td>66</td><td>Item description flag.</td></tr>
 *          <tr><td>PROP_ITEM_CATEGORIES</td><td>67</td><td>Item categories flag.</td></tr>
 *          <tr><td>PROP_ITEM_ARTIST</td><td>68</td><td>Item artist flag.</td></tr>
 *          <tr><td>PROP_ITEM_LICENSE</td><td>69</td><td>Item license flag.</td></tr>
 *          <tr><td>PROP_LIMITED_RUN</td><td>70</td><td>Limited run flag.</td></tr>
 *          <tr><td>PROP_MARKETPLACE_ID</td><td>71</td><td>Marketplace id flag.</td></tr>
 *          <tr><td>PROP_EDITION_NUMBER</td><td>72</td><td>Edition number flag.</td></tr>
 *          <tr><td>PROP_ENTITY_INSTANCE_NUMBER</td><td>73</td><td>Entity instance number flag.</td></tr>
 *          <tr><td>PROP_CERTIFICATE_ID</td><td>74</td><td>Certificate id flag.</td></tr>
 *          <tr><td>PROP_CERTIFICATE_TYPE</td><td>75</td><td>Certificate type flag.</td></tr>
 *          <tr><td>PROP_STATIC_CERTIFICATE_VERSION</td><td>76</td><td>Static certificate version flag.</td></tr>
 *          <tr><td>PROP_LOCAL_POSITION</td><td>77</td><td>Local position flag.</td></tr>
 *          <tr><td>PROP_LOCAL_ROTATION</td><td>78</td><td>Local rotation flag.</td></tr>
 *          <tr><td>PROP_LOCAL_VELOCITY</td><td>79</td><td>Local velocity flag.</td></tr>
 *          <tr><td>PROP_LOCAL_ANGULAR_VELOCITY</td><td>80</td><td>Local angular velocity flag.</td></tr>
 *          <tr><td>PROP_LOCAL_DIMENSIONS</td><td>81</td><td>Local dimensions flag.</td></tr>
 *          <tr><td>PROP_SHAPE_TYPE</td><td>82</td><td>Shape type flag.</td></tr>
 *          <tr><td>PROP_COMPOUND_SHAPE_URL</td><td>83</td><td>Compound shape url flag.</td></tr>
 *          <tr><td>PROP_COLOR</td><td>84</td><td>Color flag.</td></tr>
 *          <tr><td>PROP_ALPHA</td><td>85</td><td>Alpha flag.</td></tr>
 *          <tr><td>PROP_PULSE_MIN</td><td>86</td><td>Pulse min flag.</td></tr>
 *          <tr><td>PROP_PULSE_MAX</td><td>87</td><td>Pulse max flag.</td></tr>
 *          <tr><td>PROP_PULSE_PERIOD</td><td>88</td><td>Pulse period flag.</td></tr>
 *          <tr><td>PROP_PULSE_COLOR_MODE</td><td>89</td><td>Pulse color mode flag.</td></tr>
 *          <tr><td>PROP_PULSE_ALPHA_MODE</td><td>90</td><td>Pulse alpha mode flag.</td></tr>
 *          <tr><td>PROP_TEXTURES</td><td>91</td><td>Textures flag.</td></tr>
 *          <tr><td>PROP_DERIVED_0</td><td>92</td><td>Derived 0 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_1</td><td>93</td><td>Derived 1 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_2</td><td>94</td><td>Derived 2 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_3</td><td>95</td><td>Derived 3 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_4</td><td>96</td><td>Derived 4 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_5</td><td>97</td><td>Derived 5 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_6</td><td>98</td><td>Derived 6 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_7</td><td>99</td><td>Derived 7 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_8</td><td>100</td><td>Derived 8 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_9</td><td>101</td><td>Derived 9 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_10</td><td>102</td><td>Derived 10 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_11</td><td>103</td><td>Derived 11 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_12</td><td>104</td><td>Derived 12 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_13</td><td>105</td><td>Derived 13 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_14</td><td>106</td><td>Derived 14 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_15</td><td>107</td><td>Derived 15 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_16</td><td>108</td><td>Derived 16 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_17</td><td>109</td><td>Derived 17 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_18</td><td>110</td><td>Derived 18 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_19</td><td>111</td><td>Derived 19 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_20</td><td>112</td><td>Derived 20 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_21</td><td>113</td><td>Derived 21 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_22</td><td>114</td><td>Derived 22 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_23</td><td>115</td><td>Derived 23 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_24</td><td>116</td><td>Derived 24 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_25</td><td>117</td><td>Derived 25 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_26</td><td>118</td><td>Derived 26 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_27</td><td>119</td><td>Derived 27 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_28</td><td>120</td><td>Derived 28 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_29</td><td>121</td><td>Derived 29 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_30</td><td>122</td><td>Derived 30 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_31</td><td>123</td><td>Derived 31 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_32</td><td>124</td><td>Derived 32 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_33</td><td>125</td><td>Derived 33 flag.</td></tr>
 *          <tr><td>PROP_DERIVED_34</td><td>126</td><td>Derived 34 flag.</td></tr>
 *          <tr><td>PROP_AFTER_LAST_ITEM</td><td>127</td><td>After last item flag.</td></tr>
 *          <tr><td>PROP_MAX_PARTICLES</td><td>{@link EntityPropertyFlags|PROP_DERIVED_0}</td><td>Max particles flag. First
 *          ParticleEffect entity-specific property.</td></tr>
 *          <tr><td>PROP_LIFESPAN</td><td>{@link EntityPropertyFlags|PROP_DERIVED_1}</td><td>Lifespan flag.</td></tr>
 *          <tr><td>PROP_EMITTING_PARTICLES</td><td>{@link EntityPropertyFlags|PROP_DERIVED_2}</td><td>Emitting_particles flag.
 *          </td></tr>
 *          <tr><td>PROP_EMIT_RATE</td><td>{@link EntityPropertyFlags|PROP_DERIVED_3}</td><td>Emit rate flag.</td></tr>
 *          <tr><td>PROP_EMIT_SPEED</td><td>{@link EntityPropertyFlags|PROP_DERIVED_4}</td><td>Emit speed flag.</td></tr>
 *          <tr><td>PROP_SPEED_SPREAD</td><td>{@link EntityPropertyFlags|PROP_DERIVED_5}</td><td>Speed spread flag.</td></tr>
 *          <tr><td>PROP_EMIT_ORIENTATION</td><td>{@link EntityPropertyFlags|PROP_DERIVED_6}</td><td>Emit orientation flag.
 *          </td></tr>
 *          <tr><td>PROP_EMIT_DIMENSIONS</td><td>{@link EntityPropertyFlags|PROP_DERIVED_7}</td><td>Emit dimensions flag.</td>
 *          </tr>
 *          <tr><td>PROP_ACCELERATION_SPREAD</td><td>{@link EntityPropertyFlags|PROP_DERIVED_8}</td><td>Acceleration spread
 *          flag.</td></tr>
 *          <tr><td>PROP_POLAR_START</td><td>{@link EntityPropertyFlags|PROP_DERIVED_9}</td><td>Polar start flag.</td></tr>
 *          <tr><td>PROP_POLAR_FINISH</td><td>{@link EntityPropertyFlags|PROP_DERIVED_10}</td><td>Polar finish flag.</td></tr>
 *          <tr><td>PROP_AZIMUTH_START</td><td>{@link EntityPropertyFlags|PROP_DERIVED_11}</td><td>Azimuth start flag.</td></tr>
 *          <tr><td>PROP_AZIMUTH_FINISH</td><td>{@link EntityPropertyFlags|PROP_DERIVED_12}</td><td>Azimuth finish flag.</td>
 *          </tr>
 *          <tr><td>PROP_EMIT_RADIUS_START</td><td>{@link EntityPropertyFlags|PROP_DERIVED_13}</td><td>Emit radius start flag.
 *          </td></tr>
 *          <tr><td>PROP_EMIT_ACCELERATION</td><td>{@link EntityPropertyFlags|PROP_DERIVED_14}</td><td>Emit acceleration flag.
 *          </td></tr>
 *          <tr><td>PROP_PARTICLE_RADIUS</td><td>{@link EntityPropertyFlags|PROP_DERIVED_15}</td><td>Particle radius flag.</td>
 *          </tr>
 *          <tr><td>PROP_RADIUS_SPREAD</td><td>{@link EntityPropertyFlags|PROP_DERIVED_16}</td><td>Radius spread flag.</td></tr>
 *          <tr><td>PROP_RADIUS_START</td><td>{@link EntityPropertyFlags|PROP_DERIVED_17}</td><td>Radius start flag.</td></tr>
 *          <tr><td>PROP_RADIUS_FINISH</td><td>{@link EntityPropertyFlags|PROP_DERIVED_18}</td><td>Radius finish flag.</td></tr>
 *          <tr><td>PROP_COLOR_SPREAD</td><td>{@link EntityPropertyFlags|PROP_DERIVED_19}</td><td>Color spread flag.</td></tr>
 *          <tr><td>PROP_COLOR_START</td><td>{@link EntityPropertyFlags|PROP_DERIVED_20}</td><td>Color start flag.</td></tr>
 *          <tr><td>PROP_COLOR_FINISH</td><td>{@link EntityPropertyFlags|PROP_DERIVED_21}</td><td>Color finish flag.</td></tr>
 *          <tr><td>PROP_ALPHA_SPREAD</td><td>{@link EntityPropertyFlags|PROP_DERIVED_22}</td><td>Alpha spread flag.</td></tr>
 *          <tr><td>PROP_ALPHA_START</td><td>{@link EntityPropertyFlags|PROP_DERIVED_23}</td><td>Alpha start flag.</td></tr>
 *          <tr><td>PROP_ALPHA_FINISH</td><td>{@link EntityPropertyFlags|PROP_DERIVED_24}</td><td>Alpha finish flag.</td></tr>
 *          <tr><td>PROP_EMITTER_SHOULD_TRAIL</td><td>{@link EntityPropertyFlags|PROP_DERIVED_25}</td><td>Emitter should trail
 *          flag.</td></tr>
 *          <tr><td>PROP_PARTICLE_SPIN</td><td>{@link EntityPropertyFlags|PROP_DERIVED_26}</td><td>Particle spin flag.</td></tr>
 *          <tr><td>PROP_SPIN_START</td><td>{@link EntityPropertyFlags|PROP_DERIVED_27}</td><td>Spin start flag.</td></tr>
 *          <tr><td>PROP_SPIN_FINISH</td><td>{@link EntityPropertyFlags|PROP_DERIVED_28}</td><td>Spin finish flag.</td></tr>
 *          <tr><td>PROP_SPIN_SPREAD</td><td>{@link EntityPropertyFlags|PROP_DERIVED_29}</td><td>Spin spread flag.</td></tr>
 *          <tr><td>PROP_PARTICLE_ROTATE_WITH_ENTITY</td><td>{@link EntityPropertyFlags|PROP_DERIVED_30}</td><td>Particle rotate
 *          with entity flag.</td></tr>
 *          <tr><td>PROP_MODEL_URL</td><td>{@link EntityPropertyFlags|PROP_DERIVED_0}</td><td>Model url flag. First Model
 *          entity-specific property.<br />
 *          {@link ModelEntityItem|ModelEntity}</td></tr>
 *          <tr><td>PROP_MODEL_SCALE</td><td>{@link EntityPropertyFlags|PROP_DERIVED_1}</td><td>Model scale flag.</td></tr>
 *          <tr><td>PROP_JOINT_ROTATIONS_SET</td><td>{@link EntityPropertyFlags|PROP_DERIVED_2}</td><td>Joint rotations set
 *          flag.</td></tr>
 *          <tr><td>PROP_JOINT_ROTATIONS</td><td>{@link EntityPropertyFlags|PROP_DERIVED_3}</td><td>Joint rotations flag.</td>
 *          </tr>
 *          <tr><td>PROP_JOINT_TRANSLATIONS_SET</td><td>{@link EntityPropertyFlags|PROP_DERIVED_4}</td><td>Joint translations
 *          set flag.</td></tr>
 *          <tr><td>PROP_JOINT_TRANSLATIONS</td><td>{@link EntityPropertyFlags|PROP_DERIVED_5}</td><td>Joint translations flag.
 *          </td></tr>
 *          <tr><td>PROP_RELAY_PARENT_JOINTS</td><td>{@link EntityPropertyFlags|PROP_DERIVED_6}</td><td>Relay parent joints
 *          flag.</td></tr>
 *          <tr><td>PROP_GROUP_CULLED</td><td>{@link EntityPropertyFlags|PROP_DERIVED_7}</td><td>Group culled flag.</td></tr>
 *          <tr><td>PROP_BLENDSHAPE_COEFFICIENTS</td><td>{@link EntityPropertyFlags|PROP_DERIVED_8}</td><td>Blendshape
 *          coefficients flag.</td></tr>
 *          <tr><td>PROP_USE_ORIGINAL_PIVOT</td><td>{@link EntityPropertyFlags|PROP_DERIVED_9}</td><td>Use original pivot flag.
 *          </td></tr>
 *          <tr><td>PROP_ANIMATION_URL</td><td>{@link EntityPropertyFlags|PROP_DERIVED_10}</td><td>Animation url flag.</td></tr>
 *          <tr><td>PROP_ANIMATION_ALLOW_TRANSLATION</td><td>{@link EntityPropertyFlags|PROP_DERIVED_11}</td><td>Animation allow
 *          translation flag.</td></tr>
 *          <tr><td>PROP_ANIMATION_FPS</td><td>{@link EntityPropertyFlags|PROP_DERIVED_12}</td><td>Animation fps flag.</td></tr>
 *          <tr><td>PROP_ANIMATION_FRAME_INDEX</td><td>{@link EntityPropertyFlags|PROP_DERIVED_13}</td><td>Animation frame index
 *          flag.</td></tr>
 *          <tr><td>PROP_ANIMATION_PLAYING</td><td>{@link EntityPropertyFlags|PROP_DERIVED_14}</td><td>Animation playing flag.
 *          </td></tr>
 *          <tr><td>PROP_ANIMATION_LOOP</td><td>{@link EntityPropertyFlags|PROP_DERIVED_15}</td><td>Animation loop flag.</td>
 *          </tr>
 *          <tr><td>PROP_ANIMATION_FIRST_FRAME</td><td>{@link EntityPropertyFlags|PROP_DERIVED_16}</td><td>Animation first frame
 *          flag.</td></tr>
 *          <tr><td>PROP_ANIMATION_LAST_FRAME</td><td>{@link EntityPropertyFlags|PROP_DERIVED_17}</td><td>Animation last frame
 *          flag.</td></tr>
 *          <tr><td>PROP_ANIMATION_HOLD</td><td>{@link EntityPropertyFlags|PROP_DERIVED_18}</td><td>Animation hold flag.</td>
 *          <tr><td>PROP_SHAPE</td><td>{@link EntityPropertyFlags|PROP_DERIVED_0}</td><td>Shape flag.</td>
 *          </tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} EntityPropertyFlags
 */
enum EntityPropertyFlags {
    // C++  EntityPropertyFlags.h

    PROP_PAGED_PROPERTY,
    PROP_CUSTOM_PROPERTIES_INCLUDED,

    // Core properties
    PROP_SIMULATION_OWNER,
    PROP_PARENT_ID,
    PROP_PARENT_JOINT_INDEX,
    PROP_VISIBLE,
    PROP_NAME,
    PROP_LOCKED,
    PROP_USER_DATA,
    PROP_PRIVATE_USER_DATA,
    PROP_HREF,
    PROP_DESCRIPTION,
    PROP_POSITION,
    PROP_DIMENSIONS,
    PROP_ROTATION,
    PROP_REGISTRATION_POINT,
    PROP_CREATED,
    PROP_LAST_EDITED_BY,
    PROP_ENTITY_HOST_TYPE,
    PROP_OWNING_AVATAR_ID,
    PROP_QUERY_AA_CUBE,
    PROP_CAN_CAST_SHADOW,
    PROP_VISIBLE_IN_SECONDARY_CAMERA,
    PROP_RENDER_LAYER,
    PROP_PRIMITIVE_MODE,
    PROP_IGNORE_PICK_INTERSECTION,
    PROP_RENDER_WITH_ZONES,
    PROP_BILLBOARD_MODE,

    // Grab
    PROP_GRAB_GRABBABLE,
    PROP_GRAB_KINEMATIC,
    PROP_GRAB_FOLLOWS_CONTROLLER,
    PROP_GRAB_TRIGGERABLE,
    PROP_GRAB_EQUIPPABLE,
    PROP_GRAB_DELEGATE_TO_PARENT,
    PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET,
    PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET,
    PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET,
    PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET,
    PROP_GRAB_EQUIPPABLE_INDICATOR_URL,
    PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE,
    PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET,

    // Physics
    PROP_DENSITY,
    PROP_VELOCITY,
    PROP_ANGULAR_VELOCITY,
    PROP_GRAVITY,
    PROP_ACCELERATION,
    PROP_DAMPING,
    PROP_ANGULAR_DAMPING,
    PROP_RESTITUTION,
    PROP_FRICTION,
    PROP_LIFETIME,
    PROP_COLLISIONLESS,
    PROP_COLLISION_MASK,
    PROP_DYNAMIC,
    PROP_COLLISION_SOUND_URL,
    PROP_ACTION_DATA,

    // Cloning
    PROP_CLONEABLE,
    PROP_CLONE_LIFETIME,
    PROP_CLONE_LIMIT,
    PROP_CLONE_DYNAMIC,
    PROP_CLONE_AVATAR_ENTITY,
    PROP_CLONE_ORIGIN_ID,

    // Scripts
    PROP_SCRIPT,
    PROP_SCRIPT_TIMESTAMP,
    PROP_SERVER_SCRIPTS,

    // Certifiable Properties
    PROP_ITEM_NAME,
    PROP_ITEM_DESCRIPTION,
    PROP_ITEM_CATEGORIES,
    PROP_ITEM_ARTIST,
    PROP_ITEM_LICENSE,
    PROP_LIMITED_RUN,
    PROP_MARKETPLACE_ID,
    PROP_EDITION_NUMBER,
    PROP_ENTITY_INSTANCE_NUMBER,
    PROP_CERTIFICATE_ID,
    PROP_CERTIFICATE_TYPE,
    PROP_STATIC_CERTIFICATE_VERSION,

    // Used to convert values to and from scripts
    PROP_LOCAL_POSITION,
    PROP_LOCAL_ROTATION,
    PROP_LOCAL_VELOCITY,
    PROP_LOCAL_ANGULAR_VELOCITY,
    PROP_LOCAL_DIMENSIONS,

    // These properties are used by multiple subtypes but aren't in the base EntityItem.
    PROP_SHAPE_TYPE,
    PROP_COMPOUND_SHAPE_URL,
    PROP_COLOR,
    PROP_ALPHA,
    PROP_PULSE_MIN,
    PROP_PULSE_MAX,
    PROP_PULSE_PERIOD,
    PROP_PULSE_COLOR_MODE,
    PROP_PULSE_ALPHA_MODE,
    PROP_TEXTURES,
    // Add new shared EntityItem properties to the list above this line.

    // We need as many of these as the number of unique properties of a derived EntityItem class.
    PROP_DERIVED_0,
    PROP_DERIVED_1,
    PROP_DERIVED_2,
    PROP_DERIVED_3,
    PROP_DERIVED_4,
    PROP_DERIVED_5,
    PROP_DERIVED_6,
    PROP_DERIVED_7,
    PROP_DERIVED_8,
    PROP_DERIVED_9,
    PROP_DERIVED_10,
    PROP_DERIVED_11,
    PROP_DERIVED_12,
    PROP_DERIVED_13,
    PROP_DERIVED_14,
    PROP_DERIVED_15,
    PROP_DERIVED_16,
    PROP_DERIVED_17,
    PROP_DERIVED_18,
    PROP_DERIVED_19,
    PROP_DERIVED_20,
    PROP_DERIVED_21,
    PROP_DERIVED_22,
    PROP_DERIVED_23,
    PROP_DERIVED_24,
    PROP_DERIVED_25,
    PROP_DERIVED_26,
    PROP_DERIVED_27,
    PROP_DERIVED_28,
    PROP_DERIVED_29,
    PROP_DERIVED_30,
    PROP_DERIVED_31,
    PROP_DERIVED_32,
    PROP_DERIVED_33,
    PROP_DERIVED_34,
    PROP_AFTER_LAST_ITEM,

    // WARNING! Do not add props here unless you intentionally mean to reuse PROP_DERIVED_X indexes.
    // These properties intentionally reuse the enum values for other properties which will never overlap with each other.
    // We do this so that we don't have to expand the size of the properties bitflags mask.
    // Only add properties here that are only used by one subclass.  Otherwise, they should go above to prevent collisions

    // Particles
    PROP_MAX_PARTICLES = PROP_DERIVED_0,
    PROP_LIFESPAN = PROP_DERIVED_1,
    PROP_EMITTING_PARTICLES = PROP_DERIVED_2,
    PROP_EMIT_RATE = PROP_DERIVED_3,
    PROP_EMIT_SPEED = PROP_DERIVED_4,
    PROP_SPEED_SPREAD = PROP_DERIVED_5,
    PROP_EMIT_ORIENTATION = PROP_DERIVED_6,
    PROP_EMIT_DIMENSIONS = PROP_DERIVED_7,
    PROP_ACCELERATION_SPREAD = PROP_DERIVED_8,
    PROP_POLAR_START = PROP_DERIVED_9,
    PROP_POLAR_FINISH = PROP_DERIVED_10,
    PROP_AZIMUTH_START = PROP_DERIVED_11,
    PROP_AZIMUTH_FINISH = PROP_DERIVED_12,
    PROP_EMIT_RADIUS_START = PROP_DERIVED_13,
    PROP_EMIT_ACCELERATION = PROP_DERIVED_14,
    PROP_PARTICLE_RADIUS = PROP_DERIVED_15,
    PROP_RADIUS_SPREAD = PROP_DERIVED_16,
    PROP_RADIUS_START = PROP_DERIVED_17,
    PROP_RADIUS_FINISH = PROP_DERIVED_18,
    PROP_COLOR_SPREAD = PROP_DERIVED_19,
    PROP_COLOR_START = PROP_DERIVED_20,
    PROP_COLOR_FINISH = PROP_DERIVED_21,
    PROP_ALPHA_SPREAD = PROP_DERIVED_22,
    PROP_ALPHA_START = PROP_DERIVED_23,
    PROP_ALPHA_FINISH = PROP_DERIVED_24,
    PROP_EMITTER_SHOULD_TRAIL = PROP_DERIVED_25,
    PROP_PARTICLE_SPIN = PROP_DERIVED_26,
    PROP_SPIN_START = PROP_DERIVED_27,
    PROP_SPIN_FINISH = PROP_DERIVED_28,
    PROP_SPIN_SPREAD = PROP_DERIVED_29,
    PROP_PARTICLE_ROTATE_WITH_ENTITY = PROP_DERIVED_30,

    // Model
    PROP_MODEL_URL = PROP_DERIVED_0,
    PROP_MODEL_SCALE = PROP_DERIVED_1,
    PROP_JOINT_ROTATIONS_SET = PROP_DERIVED_2,
    PROP_JOINT_ROTATIONS = PROP_DERIVED_3,
    PROP_JOINT_TRANSLATIONS_SET = PROP_DERIVED_4,
    PROP_JOINT_TRANSLATIONS = PROP_DERIVED_5,
    PROP_RELAY_PARENT_JOINTS = PROP_DERIVED_6,
    PROP_GROUP_CULLED = PROP_DERIVED_7,
    PROP_BLENDSHAPE_COEFFICIENTS = PROP_DERIVED_8,
    PROP_USE_ORIGINAL_PIVOT = PROP_DERIVED_9,

    // Animation
    PROP_ANIMATION_URL = PROP_DERIVED_10,
    PROP_ANIMATION_ALLOW_TRANSLATION = PROP_DERIVED_11,
    PROP_ANIMATION_FPS = PROP_DERIVED_12,
    PROP_ANIMATION_FRAME_INDEX = PROP_DERIVED_13,
    PROP_ANIMATION_PLAYING = PROP_DERIVED_14,
    PROP_ANIMATION_LOOP = PROP_DERIVED_15,
    PROP_ANIMATION_FIRST_FRAME = PROP_DERIVED_16,
    PROP_ANIMATION_LAST_FRAME = PROP_DERIVED_17,
    PROP_ANIMATION_HOLD = PROP_DERIVED_18,

    // Text
    PROP_TEXT = PROP_DERIVED_0,
    PROP_LINE_HEIGHT = PROP_DERIVED_1,
    PROP_TEXT_COLOR = PROP_DERIVED_2,
    PROP_TEXT_ALPHA = PROP_DERIVED_3,
    PROP_BACKGROUND_COLOR = PROP_DERIVED_4,
    PROP_BACKGROUND_ALPHA = PROP_DERIVED_5,
    PROP_LEFT_MARGIN = PROP_DERIVED_6,
    PROP_RIGHT_MARGIN = PROP_DERIVED_7,
    PROP_TOP_MARGIN = PROP_DERIVED_8,
    PROP_BOTTOM_MARGIN = PROP_DERIVED_9,
    PROP_UNLIT = PROP_DERIVED_10,
    PROP_FONT = PROP_DERIVED_11,
    PROP_TEXT_EFFECT = PROP_DERIVED_12,
    PROP_TEXT_EFFECT_COLOR = PROP_DERIVED_13,
    PROP_TEXT_EFFECT_THICKNESS = PROP_DERIVED_14,
    PROP_TEXT_ALIGNMENT = PROP_DERIVED_15,

    // Web
    PROP_SOURCE_URL = PROP_DERIVED_0,
    PROP_DPI = PROP_DERIVED_1,
    PROP_SCRIPT_URL = PROP_DERIVED_2,
    PROP_MAX_FPS = PROP_DERIVED_3,
    PROP_INPUT_MODE = PROP_DERIVED_4,
    PROP_SHOW_KEYBOARD_FOCUS_HIGHLIGHT = PROP_DERIVED_5,
    PROP_WEB_USE_BACKGROUND = PROP_DERIVED_6,
    PROP_USER_AGENT = PROP_DERIVED_7,

    // Shape
    PROP_SHAPE = PROP_DERIVED_0,

    // Image
    PROP_IMAGE_URL = PROP_DERIVED_0,
    PROP_EMISSIVE = PROP_DERIVED_1,
    PROP_KEEP_ASPECT_RATIO = PROP_DERIVED_2,
    PROP_SUB_IMAGE = PROP_DERIVED_3

    // WEBRTC TODO: Address further C++ code.
}

export { EntityPropertyFlags };
