//
//  EntityData.ts
//
//  Created by Julien Merzoug on 16 May 2022.
//  Copyright 2022 Vircadia contributors.
//  Copyright 2022 DigiSomni LLC.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import { EntityTypes } from "../../entities/EntityTypes";
import AACube from "../../shared/AACube";
import assert from "../../shared/assert";
import ByteCountCoded from "../../shared/ByteCountCoded";
import "../../shared/DataViewExtensions";
import GLMHelpers from "../../shared/GLMHelpers";
import PropertyFlags from "../../shared/PropertyFlags";
import { quat } from "../../shared/Quat";
import Uuid from "../../shared/Uuid";
import { vec3 } from "../../shared/Vec3";
import UDT from "../udt/UDT";

import { ungzip } from "pako";


/*@devdoc
 *  The positions of the flags in {@link PropertyFlags}.
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
 *          <tr><td>PROP_MAX_PARTICLES</td><td>{@link EntityPropertyFlags|PROP_DERIVED_0}</td><td>Max particles flag.</td></tr>
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
 *          <tr><td>PROP_MODEL_URL</td><td>{@link EntityPropertyFlags|PROP_DERIVED_0}</td><td>Model url flag.</td></tr>
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
 *          </tr>
 *      </tbody>
 *  </table>
 *  @typedef {number} EntityPropertyFlags
 */
enum EntityPropertyFlags {
    // C++ EntityPropertyFlags.h

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
    // Do not add props here unless you intentionally mean to reuse PROP_DERIVED_X indexes.
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
    PROP_ANIMATION_HOLD = PROP_DERIVED_18

    // WEBRTC TODO: Address further C++ code.
}

type CommonEntityProperties = {
    entityItemID: Uuid,
    entityType: EntityTypes,
    createdFromBuffer: bigint,
    lastEdited: bigint,
    updateDelta: number,
    simulatedDelta: number,
    simOwnerData: ArrayBuffer | undefined;
    parentID: Uuid | null | undefined;
    parentJointIndex: number | undefined;
    visible: boolean | undefined;
    name: string | undefined;
    locked: boolean | undefined;
    userData: string | undefined;
    privateUserData: string | undefined;
    href: string | undefined;
    description: string | undefined;
    position: vec3 | undefined;
    dimensions: vec3 | undefined;
    rotation: quat | undefined;
    registrationPoint: vec3 | undefined;
    created: bigint | undefined;
    lastEditedBy: Uuid | undefined;
    queryAACube: AACube | undefined;
    canCastShadow: boolean | undefined;
    renderLayer: number | undefined;
    primitiveMode: number | undefined;
    ignorePickIntersection: boolean | undefined;
    renderWithZones: Uuid[] | undefined;
    billboardMode: number | undefined;
    grabbable: boolean | undefined;
    grabKinematic: boolean | undefined;
    grabFollowsController: boolean | undefined;
    triggerable: boolean | undefined;
    grabEquippable: boolean | undefined;
    delegateToParent: boolean | undefined;
    equippableLeftPositionOffset: vec3 | undefined;
    equippableLeftRotationOffset: quat | undefined;
    equippableRightPositionOffset: vec3 | undefined;
    equippableRightRotationOffset: quat | undefined;
    equippableIndicatorURL: string | undefined;
    equippableIndicatorScale: vec3 | undefined;
    equippableIndicatorOffset: vec3 | undefined;
    density: number | undefined;
    velocity: vec3 | undefined;
    angularVelocity: vec3 | undefined;
    gravity: vec3 | undefined;
    acceleration: vec3 | undefined;
    damping: number | undefined;
    angularDampling: number | undefined;
    restitution: number | undefined;
    friction: number | undefined;
    lifetime: number | undefined;
    collisionless: boolean | undefined;
    collisionMask: number | undefined;
    dynamic: boolean | undefined;
    collisionSoundURL: string | undefined;
    actionData: ArrayBuffer | undefined;
    cloneable: boolean | undefined;
    cloneLifetime: number | undefined;
    cloneLimit: number | undefined;
    cloneDynamic: boolean | undefined;
    cloneAvatarIdentity: boolean | undefined;
    cloneOriginID: Uuid | undefined;
    script: string | undefined;
    scriptTimestamp: bigint | undefined;
    serverScripts: string | undefined;
    itemName: string | undefined;
    itemDescription: string | undefined;
    itemCategories: string | undefined;
    itemArtist: string | undefined;
    itemLicense: string | undefined;
    limitedRun: number | undefined;
    marketplaceID: string | undefined;
    editionNumber: number | undefined;
    entityInstanceNumber: number | undefined;
    certificateID: string | undefined;
    certificateType: string | undefined;
    staticCertificateVersion: number | undefined;
};

type AnimationProperties = {
    animationURL: string | undefined;
    animationAllowTranslation: boolean | undefined;
    animationFPS: number | undefined;
    animationFrameIndex: number | undefined;
    animationPlaying: boolean | undefined;
    animationLoop: boolean | undefined;
    animationFirstFrame: number | undefined;
    animationLastFrame: number | undefined;
    animationHold: boolean | undefined;
};

type ModelEntityProperties = {
    shapeType: number | undefined;
    compoundShapeURL: string | undefined;
    color: vec3 | undefined;
    textures: string | undefined;
    modelURL: string | undefined;
    modelScale: vec3 | undefined;
    jointRotationsSet: boolean[] | undefined;
    jointRotations: quat[] | undefined;
    jointTranslationsSet: boolean[] | undefined;
    jointTranslations: vec3[] | undefined;
    groupCulled: boolean | undefined;
    relayParentJoints: boolean | undefined;
    blendShapeCoefficients: string | undefined;
    useOriginalPivot: boolean | undefined;
    animation: AnimationProperties | undefined;
};

type EntityDataDetails = CommonEntityProperties & ModelEntityProperties;

type EntitySubclassData = {
    bytesRead: number;
    properties: ModelEntityProperties;
};

type ParsedData = {
    bytesRead: number;
    entitiesDataDetails: EntityDataDetails[];
};


const EntityData = new class {
    // C++ N/A

    // #entityDataDetails: EntityDataDetails[] = [];

    // C++ OctreePacketData.h
    readonly #_PACKET_IS_COMPRESSED_BIT = 1;
    // C++ OctalCode.h
    readonly #_OVERFLOWED_OCTCODE_BUFFER = -1;
    readonly #_UNKNOWN_OCTCODE_LENGTH = -2;
    // Header bytes
    //    object ID [16 bytes]
    //    ByteCountCoded(type code) [~1 byte]
    //    last edited [8 bytes]
    //    ByteCountCoded(last_edited to last_updated delta) [~1-8 bytes]
    //    PropertyFlags<>( everything ) [1-2 bytes]
    // ~27-35 bytes...
    readonly #_MINIMUM_HEADER_BYTES = 27;

    /*@devdoc
     *  An animation is configured by the following properties.
     *  @typedef {object} AnimationProperties
     *  @property {string | undefined} animationURL - The URL of the glTF or FBX file that has the animation. glTF files may be
     *      in JSON or binary format (".gltf" or ".glb" URLs respectively).
     *  @property {boolean | undefined} animationAllowTranslation - <code>true</code> to enable translations contained in the
     *      animation to be played, <code>false</code> to disable translations.
     *  @property {number | undefined} animationFPS - The speed in frames/s that the animation is played at.
     *  @property {number | undefined} animationFrameIndex - The current frame being played in the animation.
     *  @property {boolean | undefined} animationPlaying - <code>true</code> if the animation should play, <code>false</code>
     *      if it shouldn't.
     *  @property {boolean | undefined} animationLoop - <code>true</code> if the animation is continuously repeated in a
     *      loop, <code>false</code> if it isn't.
     *  @property {number | undefined} animationFirstFrame - The first frame to play in the animation.
     *  @property {number | undefined} animationLastFrame - The last frame to play in the animation.
     *  @property {boolean | undefined} animationHold - <code>true</code> if the rotations and translations of the last frame
     *     played are maintained when the animation stops playing, <code>false</code> if they aren't.
     */

    /*@devdoc
     *  Information returned by {@link PacketScribe|reading} an {@link PacketType(1)|EntityData} packet.
     *  @typedef {object} PacketScribe.EntityDataDetails
     *  @property {Uuid} entityItemID - The ID of the entity.
     *  @property {EntityTypes} entityType - The entity's type. It cannot be changed after an entity is created.
     *  @property {bigint} createdFromBuffer - Timestamp for when the entity was created. Expressed in number of microseconds
     *      since Unix epoch.
     *  @property {bigint} lastEdited - Timestamp for when the entity was last edited. Expressed in number of microseconds since
     *      Unix epoch.
     *  @property {number} updateDelta - The delta between {@link EntityDataDetails|lastEdited} and the last time the entity was
     *      updated.
     *  @property {number} simulatedDelta - The delta between {@link EntityDataDetails|lastEdited} and the last time the entity
     *      was simulated.
     *  @property {ArrayBuffer | undefined} simOwnerData - The simulation owner data.
     *  @property {Uuid | null | undefined} parentID - The ID of the entity that the entity is parented to. <code>null</code>
     *      if the entity is not parented.
     *  @property {number | undefined} parentJointIndex - The joint of the entity that the entity is parented to.
     *  @property {boolean | undefined} visible - <code>true</code> if the entity is rendered, <code>false</code> if it
     *      isn't.
     *  @property {string | undefined} name - The entity's name. Doesn't have to be unique.
     *  @property {boolean | undefined} locked - <code>true</code> if properties other than locked cannot be changed and the
     *      entity cannot be deleted, <code>false</code> if all properties can be changed and the entity can be deleted.
     *  @property {string | undefined} userData - Used to store extra data about the entity in JSON format.
     *  @property {string | undefined} privateUserData - Like userData, but only accessible by server entity scripts, assignment
     *      client scripts, and users who have "Can Get and Set Private User Data" permissions in the domain.
     *  @property {string | undefined} href - A "hifi://" metaverse address that a user is teleported to when they click on the
     *      entity.
     *  @property {string | undefined} description - A description of the href property value.
     *  @property {vec3 | undefined} position - The position of the entity in world coordinates.
     *  @property {vec3 | undefined} dimensions - The dimensions of the entity. When adding an entity, if no dimensions value is
     *      specified then the model is automatically sized to its natural dimensions.
     *  @property {quat | undefined} rotation - The orientation of the entity in world coordinates.
     *  @property {vec3 | undefined} registrationPoint - The point in the entity that is set to the entity's position and is
     *      rotated about.
     *  @property {bigint | undefined} created - Timestamp for when the entity was created. Expressed in number of microseconds
     *      since Unix
     *  @property {Uuid | undefined} lastEditedBy - The session ID of the avatar or agent that most recently created or edited
     *      the entity.
     *  @property {AACube | undefined} queryAACube - The axis-aligned cube that determines where the entity lives in the entity
     *      server's octree. The cube may be considerably larger than the entity in some situations, e.g., when the entity is
     *      grabbed by an avatar: the position of the entity is determined through avatar mixer updates and so the AA cube is
     *      expanded in order to reduce unnecessary entity server updates. Scripts should not change this property's value.
     *  @property {boolean | undefined} canCastShadow - <code>true</code> if the entity can cast a shadow, <code>false</code>
     *      if it can't.
     *  @property {number | undefined} renderLayer - The layer that the entity renders in.
     *  @property {number | undefined} primitiveMode - How the entity's geometry is rendered.
     *  @property {boolean | undefined} ignorePickIntersection - <code>true</code> if Picks and RayPick ignore the entity,
     *      <code>false</code> if they don't.
     *  @property {Uuid[] | undefined} renderWithZones - A list of entity IDs representing with which zones this entity should
     *      render. If it is empty, this entity will render normally. Otherwise, this entity will only render if your avatar is
     *      within one of the zones in this list.
     *  @property {number | undefined} billboardMode - Whether the entity is billboarded to face the camera. Use the rotation
     *      property to control which axis is facing you.
     *  @property {boolean | undefined} grabbable - <code>true</code> if the entity can be grabbed, <code>false</code> if it
     *      can't be.
     *  @property {boolean | undefined} grabKinematic - <code>true</code> if the entity will be updated in a kinematic manner
     *      when grabbed; <code>false</code> if it will be grabbed using a tractor action. A kinematic grab will make the item
     *      appear more tightly held but will cause it to behave poorly when interacting with dynamic entities.
     *  @property {boolean | undefined} grabFollowsController - <code>true</code> if the entity will follow the motions of
     *      the hand controller even if the avatar's hand can't get to the implied position, <code>false</code> if it will
     *      follow the motions of the avatar's hand. This should be set true for tools, pens, etc. and <code>false</code> for
     *      things meant to decorate the hand.
     *  @property {boolean | undefined} triggerable - <code>true</code> if the entity will receive calls to trigger
     *      Controller entity methods, <code>false</code> if it won't.
     *  @property {boolean | undefined} equippable - <code>true</code> if the entity can be equipped, <code>false</code> if
     *      it cannot.
     *  @property {boolean | undefined} delegateToParent - <code>true</code> if when the entity is grabbed, the grab will be
     *      transferred to its parent entity if there is one; <code>false</code> if the grab won't be transferred, so a child
     *      entity can be grabbed and moved relative to its parent.
     *  @property {vec3 | undefined} equippableLeftPositionOffset - Positional offset from the left hand, when equipped.
     *  @property {quat | undefined} equippableLeftRotationOffset - Rotational offset from the left hand, when equipped.
     *  @property {vec3 | undefined} equippableRightPositionOffset - Positional offset from the right hand, when equipped.
     *  @property {quat | undefined} equippableRightRotationOffset - Rotational offset from the right hand, when equipped.
     *  @property {string | undefined} equippableIndicatorURL - If non-empty, this model will be used to indicate that an entity
     *      is equippable, rather than the default.
     *  @property {vec3 | undefined} equippableIndicatorScale - If equippableIndicatorURL is non-empty, this controls the scale
     *      of the displayed indicator.
     *  @property {vec3 | undefined} equippableIndicatorOffset - If equippableIndicatorURL is non-empty, this controls the
     *      relative offset of the displayed object from the equippable entity.
     *  @property {number | undefined} density - The density of the entity in <code>kg/m3</code>, range
     *      <code>100 – 10000</code>.
     *      Examples: <code>100</code> for balsa wood, <code>10000</code> for silver. The density is used in conjunction with
     *      the entity's bounding box volume to work out its mass in the application of physics.
     *  @property {vec3 | undefined} velocity - The linear velocity of the entity in m/s with respect to world coordinates.
     *  @property {vec3 | undefined} angularVelocity - The angular velocity of the entity in <code>rad/s</code> with respect to
     *      its axes, about its registration point.
     *  @property {vec3 | undefined} gravity - The acceleration due to gravity in <code>m/s2</code> that the entity should move
     *      with, in world coordinates. Use a value of <code>{ x: 0, y: -9.8, z: 0 }</code> to simulate Earth's gravity. Gravity
     *      is applied to an entity's motion only if its dynamic property is true. If changing an entity's gravity from
     *      {@link Vec3|ZERO}, you need to give it a small velocity in order to kick off physics simulation.
     *  @property {vec3 | undefined} acceleration - The current, measured acceleration of the entity, in <code>m/s2</code>.
     *  @property {number | undefined} damping - How much the linear velocity of an entity slows down over time, range
     *      <code>0.0</code> – <code>1.0</code>. A higher damping value slows down the entity more quickly. The default value is
     *      for an exponential decay timescale of <code>2.0s</code>, where it takes <code>2.0s</code> for the movement to slow
     *      to <code>1/e = 0.368</code> of its initial value.
     *  @property {number | undefined} angularDampling - How much the angular velocity of an entity slows down over time, range
     *      <code>0.0 – 1.0</code>. A higher damping value slows down the entity more quickly. The default value is for an
     *      exponential decay timescale of <code>2.0s</code>, where it takes <code>2.0s</code> for the movement to slow to
     *      <code>1/e = 0.368</code> of its initial value.
     *  @property {number | undefined} restitution - The "bounciness" of an entity when it collides, range
     *      <code>0.0 – 0.99</code>. The higher the value, the more bouncy.
     *  @property {number | undefined} friction - How much an entity slows down when it's moving against another, range
     *      <code>0.0 – 10.0</code>. The higher the value, the more quickly it slows down. Examples: <code>0.1</code> for ice,
     *      <code>0.9</code> for sandpaper.
     *  @property {number | undefined} lifetime - How long an entity lives for, in seconds, before being automatically deleted.
     *      A value of -1 means that the entity lives for ever.
     *  @property {boolean | undefined} collisionless - <code>true</code> if the entity shouldn't collide, <code>false</code>
     *      if it collides with items per its {@link EntityData|collisionMask} property.
     *  @property {number | undefined} collisionMask - What types of items the entity should collide with.
     *  @property {boolean | undefined} dynamic - <code>true</code> if the entity's movement is affected by collisions,
     *      <code>false</code> if it isn't.
     *  @property {string | undefined} collisionSoundURL - The sound that's played when the entity experiences a collision.
     *  @property {ArrayBuffer | undefined} actionData - Base-64 encoded compressed dump of the actions associated with the
     *      entity. This property is typically not used in scripts directly; rather, functions that manipulate an entity's
     *      actions update it. The size of this property increases with the number of actions. Because this property value has
     *      to fit within a Vircadia datagram packet, there is a limit to the number of actions that an entity can have; edits
     *      which would result in overflow are rejected.
     *  @property {boolean | undefined} cloneable - <code>true</code> if the domain or avatar entity can be cloned,
     *      <code>false</code> if it can't be.
     *  @property {number | undefined} cloneLifetime - The entity lifetime for clones created from this entity.
     *  @property {number | undefined} cloneLimit - The total number of clones of this entity that can exist in the domain at
     *      any given time.
     *  @property {boolean | undefined} cloneDynamic - <code>true</code> if clones created from this entity will have their
     *      dynamic property set to true, <code>false</code> if they won't.
     *  @property {boolean | undefined} cloneAvatarIdentity - <code>true</code> if clones created from this entity will be
     *      created as avatar entities, <code>false</code> if they won't be.
     *  @property {Uuid | undefined} cloneOriginID - The ID of the entity that this entity was cloned from.
     *  @property {string | undefined} script - The URL of the client entity script, if any, that is attached to the entity.
     *  @property {bigint | undefined} scriptTimestamp - Used to indicate when the client entity script was loaded. Should be an
     *      integer number of milliseconds since Unix epoch. If you update the property's value, the script is re-downloaded and
     *      reloaded.
     *  @property {string | undefined} serverScripts - The URL of the server entity script, if any, that is attached to the
     *      entity.
     *  @property {string | undefined} itemName - Certifiable name of the Marketplace item.
     *  @property {string | undefined} itemDescription - Certifiable description of the Marketplace item.
     *  @property {string | undefined} itemCategories - Certifiable category of the Marketplace item.
     *  @property {string | undefined} itemArtist - Certifiable artist that created the Marketplace item.
     *  @property {string | undefined} itemLicense - Certifiable license URL for the Marketplace item.
     *  @property {number | undefined} limitedRun - Certifiable maximum integer number of editions (copies) of the Marketplace
     *      item allowed to be sold.
     *  @property {string | undefined} marketplaceID - Certifiable UUID for the Marketplace item, as used in the URL of the
     *      item's download and its Marketplace Web page.
     *  @property {number | undefined} editionNumber - Certifiable integer edition (copy) number or the Marketplace item. Each
     *      copy sold in the Marketplace is numbered sequentially, starting at <code>1</code>.
     *  @property {number | undefined} entityInstanceNumber - Certifiable integer instance number for identical entities in a
     *      Marketplace item. A Marketplace item may have multiple, identical parts. If so, then each is numbered sequentially
     *      with an instance number.
     *  @property {string | undefined} certificateID - Hash of the entity's static certificate JSON, signed by the artist's
     *      private key.
     *  @property {string | undefined} certificateType - Type of the certificate.
     *  @property {number | undefined} staticCertificateVersion - The version of the method used to generate the certificateID.
     *  @property {number | undefined} shapeType - The shape of the collision hull used if collisions are enabled.
     *  @property {string | undefined} compoundShapeURL - The model file to use for the compound shape if shapeType is
     *      "compound".
     *  @property {vec3 | undefined} color - Currently not used.
     *  @property {string | undefined} textures - A JSON string of texture name, URL pairs used when rendering the model in
     *      place of the model's original textures. Use a texture name from the originalTextures property to override that
     *      texture.  Only the texture names and URLs to be overridden need be specified; original textures are used where there
     *      are no overrides. You can use JSON.stringify() to convert a JavaScript object of name, URL pairs into a JSON string.
     *  @property {string | undefined} modelURL - The URL of the glTF, FBX, or OBJ model. glTF models may be in JSON or binary
     *      format (".gltf" or ".glb" URLs respectively). Baked models' URLs have ".baked" before the file type. Model files may
     *      also be compressed in GZ format, in which case the URL ends in ".gz".
     *  @property {vec3 | undefined} modelScale - The scale factor applied to the model's dimensions.
     *  @property {boolean | undefined} jointRotationsSet - <code>true</code> values for joints that have had rotations
     *      applied, <code>false</code> otherwise; Empty if none are applied or the model hasn't loaded.
     *  @property {quat[] | undefined} jointRotations - Joint rotations applied to the model; Empty if none are applied or the
     *      model hasn't loaded.
     *  @property {boolean | undefined} jointTranslationsSet - <code>true</code> values for joints that have had translations
     *      applied, <code>false</code> otherwise; Empty if none are applied or the model hasn't loaded.
     *  @property {vec3[] | undefined} jointTranslations - Joint translations applied to the model; Empty if none are applied or
     *      the model hasn't loaded.
     *  @property {boolean | undefined} groupCulled - <code>true</code> if the mesh parts of the model are LOD culled as a
     *      group, <code>false</code> if separate mesh parts are LOD culled individually.
     *  @property {boolean | undefined} relayParentJoints - <code>true</code> if when the entity is parented to an avatar,
     *      the avatar's joint rotations are applied to the entity's joints; <code>false</code> if a parent avatar's joint
     *      rotations are not applied to the entity's joints.
     *  @property {string | undefined} blendShapeCoefficients - A JSON string of a map of blendshape names to values. Only
     *      stores set values. When editing this property, only coefficients that you are editing will change; it will not
     *      explicitly reset other coefficients.
     *  @property {boolean | undefined} useOriginalPivot - If <code>false</code>, the model will be centered based on its
     *      content, ignoring any offset in the model itself. If <code>true</code>, the model will respect its original offset.
     *      Currently, only pivots relative to <code>{x: 0, y: 0, z: 0}</code> are supported.
     *  @property {AnimationProperties | undefined} animation - An animation to play on the model.
     */

    /*@devdoc
     *  Reads an {@link PacketType(1)|EntityData} packet containing the details of one or more entities.
     *  @function PacketScribe.EntityData&period;read
     *  @read {DataView} data - The {@link Packets|EntityData} message data to read.
     *  @returns {PacketScribe.EntityDataDetails[]} The entity data for one or more entities.
     */
    read(data: DataView): EntityDataDetails[] {
        // C++ void OctreeProcessor::processDatagram(ReceivedMessage& message, SharedNodePointer sourceNode)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = 0;

        const flags = data.getUint8(dataPosition);
        dataPosition += 1;

        /* eslint-disable @typescript-eslint/no-unused-vars */

        // Skip over the sequence value which is used for safe landing.
        dataPosition += 2;

        // WEBRTC TODO: Read and use the variable sentAt as in the C++ method OctreeProcessor::processDatagram
        dataPosition += 8;

        /* eslint-enable @typescript-eslint/no-unused-vars */

        const packetIsCompressed = flags >> 7 - this.#_PACKET_IS_COMPRESSED_BIT & 1;

        let error = false;

        let entityDataDetails: EntityDataDetails[] = [];

        while (data.byteLength - dataPosition > 0 && !error) {
            const entityMessage = new DataView(data.buffer.slice(data.byteOffset + dataPosition));
            let entityMessagePosition = 0;

            // eslint-disable-next-line @typescript-eslint/init-declarations
            let sectionLength;
            if (packetIsCompressed) {
                // 2 represents sizeof(OCTREE_PACKET_INTERNAL_SECTION_SIZE) in the C++ code.
                if (entityMessage.byteLength > 2) {
                    sectionLength = entityMessage.getUint16(entityMessagePosition, UDT.LITTLE_ENDIAN);
                    entityMessagePosition += 2;
                } else {
                    sectionLength = 0;
                    error = true;
                }
            } else {
                sectionLength = entityMessage.byteLength;
            }

            if (sectionLength > 0) {
                // eslint-disable-next-line @typescript-eslint/init-declarations
                let entityData;

                if (packetIsCompressed) {
                    // Skip the next 4 bytes (QT qCompress header).
                    const compressedData = entityMessage.buffer.slice(entityMessage.byteOffset + entityMessagePosition + 4);
                    entityData = new DataView(ungzip(compressedData).buffer);
                } else {
                    entityData = new DataView(entityMessage.buffer.slice(entityMessage.byteOffset + entityMessagePosition));
                }

                let bytesRead = 0;
                // WEBRTC TODO: This won't throw once all entity types are supported.
                try {
                    const parsedData = this.#readBitstreamToTree(entityData);
                    bytesRead = parsedData.bytesRead;
                    entityDataDetails = [...entityDataDetails, ...parsedData.entitiesDataDetails];
                } catch (err) {
                    // Discard the whole packet.
                    return [];
                }

                assert(sectionLength !== bytesRead);
                dataPosition += sectionLength;
            }
            dataPosition += entityMessagePosition;
        }

        // WEBRTC TODO: Address further C++ code.

        /* eslint-enable @typescript-eslint/no-magic-numbers */

        return entityDataDetails;
    }

    #readBitstreamToTree(data: DataView): ParsedData {
        // C++ void Octree::readBitstreamToTree(const unsigned char * bitstream, uint64_t bufferSizeBytes,
        //     ReadBitstreamToTreeParams& args)

        let dataPosition = 0;

        let entitiesDataDetails: EntityDataDetails[] = [];

        while (dataPosition < data.byteLength) {
            const numberOfThreeBitSectionsInStream = this.#numberOfThreeBitSectionsInCode(data, dataPosition, data.byteLength);

            const octalCodeBytes = this.#bytesRequiredForCodeLength(numberOfThreeBitSectionsInStream);
            dataPosition += octalCodeBytes;

            const parsedData = this.#readElementData(data, dataPosition);
            dataPosition += parsedData.bytesRead;

            entitiesDataDetails = [...entitiesDataDetails, ...parsedData.entitiesDataDetails];
        }
        return {
            bytesRead: dataPosition,
            entitiesDataDetails
        };
    }

    #readElementData(data: DataView, position: number): ParsedData {
        // C++ int Octree::readElementData(const OctreeElementPointer& destinationElement, const unsigned char* nodeData,
        //     int bytesAvailable, ReadBitstreamToTreeParams& args) {

        let dataPosition = position;

        // 1 represents sizeof(unsigned char) in the C++ code.
        if (data.byteLength - dataPosition < 1) {
            console.error("Not enough meaningful data.");
            return {
                bytesRead: dataPosition - position,
                entitiesDataDetails: []
            };
        }

        // Skip over colorInPacketMask which is used for the management of the octree in the native client.
        dataPosition += 1;

        // WEBRTC TODO: Do not hardcode value.
        // eslint-disable-next-line
        // @ts-ignore
        const bytesForMask = 2;
        dataPosition += bytesForMask;

        // WEBRTC TODO: Address further C++ code.

        const parsedData = this.#readEntityDataFromBuffer(data, dataPosition);
        dataPosition += parsedData.bytesRead;

        return {
            bytesRead: dataPosition - position,
            entitiesDataDetails: parsedData.entitiesDataDetails
        };
    }

    #readEntityDataFromBuffer(data: DataView, pos: number): ParsedData {
        // C++ int EntityTree::readEntityDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //     ReadBitstreamToTreeParams& args)

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        let dataPosition = pos;

        const textDecoder = new TextDecoder();

        // 2 represents sizeof(numberOfEntities) in the C++ code.
        if (data.byteLength - dataPosition < 2) {
            console.error("Not enough meaningful data");
            return {
                bytesRead: dataPosition - pos,
                entitiesDataDetails: []
            };
        }

        const numberOfEntities = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
        dataPosition += 2;

        if (data.byteLength < numberOfEntities * this.#_MINIMUM_HEADER_BYTES) {
            console.error("Not enough meaningful data");
            return {
                bytesRead: dataPosition - pos,
                entitiesDataDetails: []
            };
        }

        const entitiesDataDetails: EntityDataDetails[] = [];
        const codec = new ByteCountCoded();

        for (let i = 0; i < numberOfEntities; i++) {
            const entityItemID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
            dataPosition += 16;

            let encodedData = new DataView(data.buffer, data.byteOffset + dataPosition);
            dataPosition += codec.decode(encodedData, encodedData.byteLength);
            const entityType = codec.data;

            // WEBRTC TODO: Unnecessary check once all entity types are supported.
            if (entityType !== EntityTypes.Model) {
                const errorMessage = `Entity type is not supported: ${entityType}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }

            const createdFromBuffer = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 8;

            const lastEdited = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 8;

            encodedData = new DataView(data.buffer, data.byteOffset + dataPosition);
            dataPosition += codec.decode(encodedData, encodedData.byteLength);
            const updateDelta = codec.data;

            encodedData = new DataView(data.buffer, data.byteOffset + dataPosition);
            dataPosition += codec.decode(encodedData, encodedData.byteLength);
            const simulatedDelta = codec.data;

            const propertyFlags = new PropertyFlags();
            const encodedFlags = new DataView(data.buffer, data.byteOffset + dataPosition);
            dataPosition += propertyFlags.decode(encodedFlags, encodedFlags.byteLength);

            let simOwnerData: ArrayBuffer | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SIMULATION_OWNER)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    const buffer = new Uint8Array(length);
                    const view = new DataView(buffer.buffer);

                    for (let j = 0; j < length; j++) {
                        view.setUint8(j, data.getUint8(dataPosition));
                        dataPosition += 1;
                    }
                    simOwnerData = buffer;
                }
            }

            let parentID: Uuid | null | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SIMULATION_OWNER)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    parentID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
                    dataPosition += 16;
                } else {
                    parentID = null;
                }
            }

            let parentJointIndex: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PARENT_JOINT_INDEX)) {
                parentJointIndex = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
            }

            let visible: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VISIBLE)) {
                visible = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let name: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_NAME)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
                if (length > 0) {
                    name = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let locked: boolean | undefined = false;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LOCKED)) {
                locked = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let userData: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_USER_DATA)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
                if (length > 0) {
                    userData = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let privateUserData: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PRIVATE_USER_DATA)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
                if (length > 0) {
                    privateUserData = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let href: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_HREF)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
                if (length > 0) {
                    href = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let description: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DESCRIPTION)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
                if (length > 0) {
                    description = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let position: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_POSITION)) {
                position = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let dimensions: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DIMENSIONS)) {
                dimensions = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let rotation: quat | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ROTATION)) {
                rotation = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
                dataPosition += 8;
            }

            let registrationPoint: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_REGISTRATION_POINT)) {
                registrationPoint = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let created: bigint | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CREATED)) {
                created = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 8;
            }

            let lastEditedBy: Uuid | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LAST_EDITED_BY)) {
                const lastEditedLength = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (lastEditedLength > 0) {
                    lastEditedBy = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
                    dataPosition += 16;
                }
            }

            let queryAACube: AACube | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_QUERY_AA_CUBE)) {
                const corner = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;

                const scale = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;

                queryAACube = new AACube(corner, scale);
            }

            let canCastShadow: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CAN_CAST_SHADOW)) {
                canCastShadow = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let renderLayer: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RENDER_LAYER)) {
                renderLayer = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let primitiveMode: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_PRIMITIVE_MODE)) {
                primitiveMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let ignorePickIntersection: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_IGNORE_PICK_INTERSECTION)) {
                ignorePickIntersection = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let renderWithZones: Uuid[] | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RENDER_WITH_ZONES)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    renderWithZones = [];
                    for (let j = 0; j < length; j++) {
                        renderWithZones.push(
                            new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN))
                        );
                        dataPosition += 16;
                    }
                }

            }

            let billboardMode: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BILLBOARD_MODE)) {
                billboardMode = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let grabbable: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_GRABBABLE)) {
                grabbable = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let grabKinematic: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_KINEMATIC)) {
                grabKinematic = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let grabFollowsController: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_FOLLOWS_CONTROLLER)) {
                grabFollowsController = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let triggerable: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_TRIGGERABLE)) {
                triggerable = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let grabEquippable: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE)) {
                grabEquippable = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let delegateToParent: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_DELEGATE_TO_PARENT)) {
                delegateToParent = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let equippableLeftPositionOffset: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_LEFT_EQUIPPABLE_POSITION_OFFSET)) {
                equippableLeftPositionOffset = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let equippableLeftRotationOffset: quat | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_LEFT_EQUIPPABLE_ROTATION_OFFSET)) {
                equippableLeftRotationOffset
                        = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
                dataPosition += 8;
            }

            let equippableRightPositionOffset: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_RIGHT_EQUIPPABLE_POSITION_OFFSET)) {
                equippableRightPositionOffset = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let equippableRightRotationOffset: quat | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_RIGHT_EQUIPPABLE_ROTATION_OFFSET)) {
                equippableRightRotationOffset
                        = GLMHelpers.unpackOrientationQuatFromBytes(data, dataPosition);
                dataPosition += 8;
            }

            let equippableIndicatorURL: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_URL)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    equippableIndicatorURL = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let equippableIndicatorScale: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_SCALE)) {
                equippableIndicatorScale = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let equippableIndicatorOffset: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAB_EQUIPPABLE_INDICATOR_OFFSET)) {
                equippableIndicatorOffset = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let density: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DENSITY)) {
                density = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let velocity: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_VELOCITY)) {
                velocity = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let angularVelocity: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANGULAR_VELOCITY)) {
                angularVelocity = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let gravity: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GRAVITY)) {
                gravity = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let acceleration: vec3 | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ACCELERATION)) {
                acceleration = {
                    x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                    y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                    z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
                };
                dataPosition += 12;
            }

            let damping: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DAMPING)) {
                damping = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let angularDampling: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANGULAR_DAMPING)) {
                angularDampling = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let restitution: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RESTITUTION)) {
                restitution = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let friction: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_FRICTION)) {
                friction = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let lifetime: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LIFETIME)) {
                lifetime = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let collisionless: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISIONLESS)) {
                collisionless = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let collisionMask: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISION_MASK)) {
                collisionMask = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;
            }

            let dynamic: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_DYNAMIC)) {
                dynamic = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let collisionSoundURL: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLLISION_SOUND_URL)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    collisionSoundURL = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let actionData: ArrayBuffer | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ACTION_DATA)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    const buffer = new Uint8Array(length);
                    const view = new DataView(buffer.buffer);
                    for (let j = 0; j < length; j++) {
                        view.setUint8(j, data.getUint8(dataPosition));
                        dataPosition += 1;
                    }
                    actionData = buffer;

                }
            }

            let cloneable: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONEABLE)) {
                cloneable = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let cloneLifetime: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_LIFETIME)) {
                cloneLifetime = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let cloneLimit: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_LIMIT)) {
                cloneLimit = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let cloneDynamic: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_DYNAMIC)) {
                cloneDynamic = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let cloneAvatarIdentity: boolean | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_AVATAR_ENTITY)) {
                cloneAvatarIdentity = Boolean(data.getUint8(dataPosition));
                dataPosition += 1;
            }

            let cloneOriginID: Uuid | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CLONE_ORIGIN_ID)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    cloneOriginID = new Uuid(data.getBigUint128(dataPosition, UDT.BIG_ENDIAN));
                    dataPosition += 16;
                }
            }

            let script: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCRIPT)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    script = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let scriptTimestamp: bigint | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SCRIPT_TIMESTAMP)) {
                scriptTimestamp = data.getBigUint64(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 8;
            }

            let serverScripts: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SERVER_SCRIPTS)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    serverScripts = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let itemName: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_NAME)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    itemName = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let itemDescription: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_DESCRIPTION)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    itemDescription = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let itemCategories: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_CATEGORIES)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    itemCategories = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let itemArtist: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_ARTIST)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    itemArtist = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let itemLicense: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ITEM_LICENSE)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    itemLicense = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let limitedRun: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_LIMITED_RUN)) {
                limitedRun = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let marketplaceID: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MARKETPLACE_ID)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    marketplaceID = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let editionNumber: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_EDITION_NUMBER)) {
                editionNumber = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let entityInstanceNumber: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ENTITY_INSTANCE_NUMBER)) {
                entityInstanceNumber = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }

            let certificateID: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CERTIFICATE_ID)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    certificateID = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let certificateType: string | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_CERTIFICATE_TYPE)) {
                const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 2;

                if (length > 0) {
                    certificateType = textDecoder.decode(
                        new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                    );
                    dataPosition += length;
                }
            }

            let staticCertificateVersion: number | undefined = undefined;
            if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_STATIC_CERTIFICATE_VERSION)) {
                staticCertificateVersion = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
                dataPosition += 4;
            }


            // The C++ code uses polymorphism to call the right method. Here we use a switch statement instead.
            // eslint-disable-next-line @typescript-eslint/init-declarations
            let subclassData: EntitySubclassData;
            switch (entityType) {
                case EntityTypes.Model: {
                    subclassData = this.#readEntitySubclassDataFromBuffer(data, dataPosition, propertyFlags);
                    break;
                }
                default:
                    // WEBRTC TODO: This line will be unreachable once all entity types are supported.
                    console.error("Entity type not supported: ", entityType);
                    return {
                        bytesRead: dataPosition - pos,
                        entitiesDataDetails: []
                    };
            }

            dataPosition += subclassData.bytesRead;

            entitiesDataDetails.push({
                entityItemID,
                entityType,
                createdFromBuffer,
                lastEdited,
                updateDelta,
                simulatedDelta,
                simOwnerData,
                parentID,
                parentJointIndex,
                visible,
                name,
                locked,
                userData,
                privateUserData,
                href,
                description,
                position,
                dimensions,
                rotation,
                registrationPoint,
                created,
                lastEditedBy,
                queryAACube,
                canCastShadow,
                renderLayer,
                primitiveMode,
                ignorePickIntersection,
                renderWithZones,
                billboardMode,
                grabbable,
                grabKinematic,
                grabFollowsController,
                triggerable,
                grabEquippable,
                delegateToParent,
                equippableLeftPositionOffset,
                equippableLeftRotationOffset,
                equippableRightPositionOffset,
                equippableRightRotationOffset,
                equippableIndicatorURL,
                equippableIndicatorScale,
                equippableIndicatorOffset,
                density,
                velocity,
                angularVelocity,
                gravity,
                acceleration,
                damping,
                angularDampling,
                restitution,
                friction,
                lifetime,
                collisionless,
                collisionMask,
                dynamic,
                collisionSoundURL,
                actionData,
                cloneable,
                cloneLifetime,
                cloneLimit,
                cloneDynamic,
                cloneAvatarIdentity,
                cloneOriginID,
                script,
                scriptTimestamp,
                serverScripts,
                itemName,
                itemDescription,
                itemCategories,
                itemArtist,
                itemLicense,
                limitedRun,
                marketplaceID,
                editionNumber,
                entityInstanceNumber,
                certificateID,
                certificateType,
                staticCertificateVersion,
                ...subclassData.properties
            });
        }

        /* eslint-disable @typescript-eslint/no-magic-numbers */

        return {
            bytesRead: dataPosition - pos,
            entitiesDataDetails
        };
    }

    // eslint-disable-next-line max-len
    #readEntitySubclassDataFromBuffer(data: DataView, position: number, propertyFlags: PropertyFlags): EntitySubclassData { // eslint-disable-line class-methods-use-this
        // C++ int ModelEntityItem::readEntitySubclassDataFromBuffer(const unsigned char* data, int bytesLeftToRead,
        //     ReadBitstreamToTreeParams& args, EntityPropertyFlags& propertyFlags, bool overwriteLocalData,
        //     bool& somethingChanged)

        let dataPosition = position;

        const textDecoder = new TextDecoder();

        let shapeType: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_SHAPE_TYPE)) {
            shapeType = data.getUint32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let compoundShapeURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COMPOUND_SHAPE_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                compoundShapeURL = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let color: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_COLOR)) {
            // The C++ stores the color property into a glm::u8vec3. It does not matter here
            // because the type of x, y and z is number.
            color = {
                x: data.getUint8(dataPosition),
                y: data.getUint8(dataPosition + 1),
                z: data.getUint8(dataPosition + 2)
            };
            dataPosition += 3;
        }

        let textures: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_TEXTURES)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                textures = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let modelURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MODEL_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                modelURL = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let modelScale: vec3 | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_MODEL_SCALE)) {
            modelScale = {
                x: data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN),
                y: data.getFloat32(dataPosition + 4, UDT.LITTLE_ENDIAN),
                z: data.getFloat32(dataPosition + 8, UDT.LITTLE_ENDIAN)
            };
            dataPosition += 12;
        }

        let jointRotationsSet: boolean[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS_SET)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointRotationsSet = [];
                for (let j = 0; j < length; j++) {
                    jointRotationsSet.push(Boolean(data.getUint8(dataPosition + j)));
                }
                dataPosition += length;
            }
        }

        let jointRotations: quat[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_ROTATIONS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointRotations = [];
                for (let j = 0; j < length; j++) {
                    jointRotations.push(
                        GLMHelpers.unpackOrientationQuatFromBytes(
                            data, dataPosition + j * 8
                        )
                    );
                }
                dataPosition += length;
            }
        }

        let jointTranslationsSet: boolean[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS_SET)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointTranslationsSet = [];
                for (let j = 0; j < length; j++) {
                    jointTranslationsSet.push(Boolean(data.getUint8(dataPosition + j)));
                }
                dataPosition += length;
            }
        }

        let jointTranslations: vec3[] | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_JOINT_TRANSLATIONS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                jointTranslations = [];
                for (let j = 0; j < length; j++) {
                    jointTranslations.push(
                        {
                            x: data.getFloat32(dataPosition + j * 12, UDT.LITTLE_ENDIAN),
                            y: data.getFloat32(dataPosition + 4 + j * 12, UDT.LITTLE_ENDIAN),
                            z: data.getFloat32(dataPosition + 8 + j * 12, UDT.LITTLE_ENDIAN)
                        }
                    );

                }
                dataPosition += length;
            }
        }

        let relayParentJoints: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_RELAY_PARENT_JOINTS)) {
            relayParentJoints = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let groupCulled: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_GROUP_CULLED)) {
            groupCulled = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let blendShapeCoefficients: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_BLENDSHAPE_COEFFICIENTS)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                blendShapeCoefficients = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let useOriginalPivot: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_USE_ORIGINAL_PIVOT)) {
            useOriginalPivot = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let animationURL: string | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_URL)) {
            const length = data.getUint16(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 2;

            if (length > 0) {
                animationURL = textDecoder.decode(
                    new Uint8Array(data.buffer, data.byteOffset + dataPosition, length)
                );
                dataPosition += length;
            }
        }

        let animationAllowTranslation: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_ALLOW_TRANSLATION)) {
            animationAllowTranslation = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let animationFPS: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FPS)) {
            animationFPS = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let animationFrameIndex: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FRAME_INDEX)) {
            animationFrameIndex = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let animationPlaying: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_PLAYING)) {
            animationPlaying = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let animationLoop: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_LOOP)) {
            animationLoop = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        let animationFirstFrame: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_FIRST_FRAME)) {
            animationFirstFrame = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let animationLastFrame: number | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_LAST_FRAME)) {
            animationLastFrame = data.getFloat32(dataPosition, UDT.LITTLE_ENDIAN);
            dataPosition += 4;
        }

        let animationHold: boolean | undefined = undefined;
        if (propertyFlags.getHasProperty(EntityPropertyFlags.PROP_ANIMATION_HOLD)) {
            animationHold = Boolean(data.getUint8(dataPosition));
            dataPosition += 1;
        }

        return {
            bytesRead: dataPosition - position,
            properties: {
                shapeType,
                compoundShapeURL,
                color,
                textures,
                modelURL,
                modelScale,
                jointRotationsSet,
                jointRotations,
                jointTranslationsSet,
                jointTranslations,
                groupCulled,
                relayParentJoints,
                blendShapeCoefficients,
                useOriginalPivot,
                animation: {
                    animationURL,
                    animationAllowTranslation,
                    animationFPS,
                    animationFrameIndex,
                    animationPlaying,
                    animationLoop,
                    animationFirstFrame,
                    animationLastFrame,
                    animationHold
                }
            }
        };
    }

    // Implemented recursively in the C++ code, numberOfThreeBitSectionsInCode is here implemented iteratively.
    #numberOfThreeBitSectionsInCode(data: DataView, dataPosition: number, maxBytes: number): number {
        // C++ int OctalCode::numberOfThreeBitSectionsInCode(const unsigned char* octalCode, int maxBytes)

        if (maxBytes === this.#_OVERFLOWED_OCTCODE_BUFFER) {
            return this.#_OVERFLOWED_OCTCODE_BUFFER;
        }

        let dataPos = dataPosition;

        let curOctalCode = data.getUint8(dataPosition);
        let result = curOctalCode;
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        while (curOctalCode === 255) {
            result += curOctalCode;
            dataPos += 1;
            curOctalCode = data.getUint8(dataPos);

            const newMaxBytes = maxBytes === this.#_UNKNOWN_OCTCODE_LENGTH
                ? this.#_UNKNOWN_OCTCODE_LENGTH
                : maxBytes - 1;

            if (newMaxBytes === this.#_OVERFLOWED_OCTCODE_BUFFER) {
                result += this.#_OVERFLOWED_OCTCODE_BUFFER;
                break;
            }
        }
        return result;
    }

    #bytesRequiredForCodeLength(threeBitCodes: number): number { // eslint-disable-line class-methods-use-this
        // C++ size_t OctalCode::bytesRequiredForCodeLength(unsigned char threeBitCodes)

        if (threeBitCodes === 0) {
            return 1;
        }
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        return 1 + Math.ceil(threeBitCodes * 3 / 8.0);
    }


}();

export default EntityData;
export type { EntityDataDetails };
