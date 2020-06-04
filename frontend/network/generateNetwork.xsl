<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                version="2.0">


    <xsl:template match="/">

      <!--Beginning of SVG-->
        <svg xmlns="http://www.w3.org/2000/svg" id="svg"
             style="position:absolute;top:0; left:0; height:calc(100% - 36px); width:100%">
            

            <style>

                .small { font: italic 14px sans-serif; }
            </style>

            <!-- decleration of constants-->
            <xsl:variable name="uID" select="count(network/users/user)"/>
            <xsl:variable name="rad" select="1300"/>
            <xsl:variable name="usID" select="count(network/users/user) div 18"/>
            <xsl:variable name="yPos" select="($usID+2) * $rad div 2"/>
            <xsl:variable name="xPos" select="($usID+2) * $rad div 2"/>

            
            <!-- iterate trough all users and draw them as block on svg-->
            <xsl:for-each select="network/users/user">


                <xsl:variable name="angle"
                              select="(360 div ($uID - 1) * 0.0174533 * (position()-1))"/>  <!-- Calculate angle and convert into RAD -->
                <xsl:variable name="offset" select="300 + 150 * ($usID + 1)"/>
                
                
                <xsl:if test="position()  &gt; 1">

                    <!-- calculate sin and cos for circular positioning-->
                    <xsl:variable name="xCos"
                                  select="1-(($angle*$angle) div 2) + (($angle*$angle*$angle*$angle) div 24) - (($angle*$angle*$angle*$angle*$angle*$angle) div 720) + (($angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle) div 40320 ) - (($angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle) div 3628800) + (($angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle) div 479001600) - (($angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle) div 87170000000) + (($angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle) div 20920000000000)"/>
                    <xsl:variable name="ySin"
                                  select="$angle -(($angle*$angle*$angle) div 6) + (($angle*$angle*$angle*$angle*$angle) div 120) - (($angle*$angle*$angle*$angle*$angle*$angle*$angle) div 5040) + (($angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle) div 362880 ) - (($angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle) div 39916800) + (($angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle) div 6227020800) - (($angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle*$angle) div 1307000000000)"/>
                    <xsl:variable name="x" select='format-number($xCos * $offset, "#")'/>
                    <xsl:variable name="y" select='format-number($ySin * $offset, "#")'/>
                    <xsl:variable name="usrID" select="userid"/>
                    
                    <!-- balanced positioning calculated by postion in xml file and mod-->
                    <xsl:if test="position() mod 3 = 1">

                       

                        <xsl:call-template name="block">
                            <xsl:with-param name="radius" select="4"/>
                            <xsl:with-param name="x" select="($xPos + number($x)) + $xCos * $offset * 1.2"/>
                            <xsl:with-param name="y" select="$yPos + number($y) + $ySin * $offset * 1.2"/>
                            <xsl:with-param name="name" select="concat(name, ' ', surname)"/>
                            <xsl:with-param name="id" select="userid"/>
                            <xsl:with-param name="xpos" select="$xPos"/>
                            <xsl:with-param name="ypos" select="$yPos"/>
                            <xsl:with-param name="reg" select="registered"/>
                            <xsl:with-param name="sign" select="signedin"/>
                            <xsl:with-param name="conn"
                                            select="/network/connections/connection[toid= $usrID ]/*[self::category]/text()"/>
                        </xsl:call-template>


                    </xsl:if>

                    <xsl:if test="position() mod 3 = 2">

                        
                        <xsl:call-template name="block">
                            <xsl:with-param name="radius" select="4"/>
                            <xsl:with-param name="x" select="($xPos + number($x)) + $xCos * $offset*1.5"/>
                            <xsl:with-param name="y" select="$yPos + number($y) + $ySin * $offset*1.5"/>
                            <xsl:with-param name="name" select="concat(name, ' ', surname)"/>
                            <xsl:with-param name="id" select="userid"/>
                            <xsl:with-param name="xpos" select="$xPos"/>
                            <xsl:with-param name="ypos" select="$yPos"/>
                            <xsl:with-param name="reg" select="registered"/>
                            <xsl:with-param name="sign" select="signedin"/>
                            <xsl:with-param name="conn"
                                            select="/network/connections/connection[toid= $usrID]/*[self::category]/text()"/>
                        </xsl:call-template>

                    </xsl:if>

                    <xsl:if test="position() mod 3 = 0">


                        

                        <xsl:call-template name="block">
                            <xsl:with-param name="radius" select="4"/>
                            <xsl:with-param name="x" select="$xPos + number($x)  + $xCos * $offset* 0.5"/>
                            <xsl:with-param name="y" select="$yPos + number($y)  + $ySin * $offset* 0.5"/>
                            <xsl:with-param name="name" select="concat(name, ' ', surname)"/>
                            <xsl:with-param name="id" select="userid"/>
                            <xsl:with-param name="xpos" select="$xPos"/>
                            <xsl:with-param name="ypos" select="$yPos"/>
                            <xsl:with-param name="reg" select="registered"/>
                            <xsl:with-param name="sign" select="signedin"/>
                            <xsl:with-param name="conn"
                                            select="/network/connections/connection[toid= $usrID ]/*[self::category]/text()"/>
                        </xsl:call-template>


                        


                    </xsl:if>


                </xsl:if>


            </xsl:for-each>

            <!-- redraw main user-->
            <xsl:variable name="mainName" select="network/users/user/name"></xsl:variable>
            <xsl:variable name="mainSurName" select="network/users/user/surname"></xsl:variable>
            <xsl:variable name="mainID" select="network/users/user/userid"></xsl:variable>
            <xsl:call-template name="block">
                <xsl:with-param name="radius" select="4"/>
                <xsl:with-param name="x" select="$xPos"/>
                <xsl:with-param name="y" select="$yPos"/>
                <xsl:with-param name="name" select="concat($mainName, ' ', $mainSurName)"/>
                <xsl:with-param name="id" select="$mainID"/>
                <xsl:with-param name="xpos" select="$xPos"/>
                <xsl:with-param name="ypos" select="$yPos"/>
                <xsl:with-param name="reg" select="1"/>
                <xsl:with-param name="sign" select="1"/>
                <xsl:with-param name="conn"
                                select="/network/connections/connection[toid=$mainID]/*[self::category]/text()"/>
            </xsl:call-template>


        </svg>

    </xsl:template>


    <xsl:template name="block">
        <xsl:param name="x"/>
        <xsl:param name="y"/>
        <xsl:param name="radius"/>
        <xsl:param name="name"/>
        <xsl:param name="id"/>
        <xsl:param name="xpos"/>
        <xsl:param name="ypos"/>
        <xsl:param name="reg"/>
        <xsl:param name="sign"/>
        <xsl:param name="conn"/>

        <xsl:variable name="fileprefix">https://the-network.raphael-muesseler.de/server/getProfileImage?userid=</xsl:variable>
        <!-- <xsl:variable name="fileprefix">http://localhost/server/getProfileImage?userid=</xsl:variable> -->
        <!-- function to call if expand button or colored bar is pressed-->
        <xsl:variable name="onExpandAccountBox">onExpandAccountBox(<xsl:value-of select="$id"/>)
        </xsl:variable>
        <xsl:variable name="onExpandMap">onExpandMap(<xsl:value-of select="$id"/>)
        </xsl:variable>

        <!-- Style of connection line-->
        <xsl:if test="$conn = 'business'">
            <line x1="{$xpos}" y1="{$ypos}" x2="{$x}" y2="{$y}" xmlns="http://www.w3.org/2000/svg"
                  style="stroke:#41dff4;stroke-width:2;"/>
        </xsl:if>
        <xsl:if test="$conn = 'private'">
            <line x1="{$xpos}" y1="{$ypos}" x2="{$x}" y2="{$y}" xmlns="http://www.w3.org/2000/svg"
                  style="stroke:#ebf442;stroke-width:2;"/>
        </xsl:if>
        <xsl:if test="$conn = 'both'">
            <line x1="{$xpos}" y1="{$ypos}" x2="{$x}" y2="{$y}" xmlns="http://www.w3.org/2000/svg"
                  style="stroke:#41dff4;stroke-width:6;"/>
            <line x1="{$xpos}" y1="{$ypos}" x2="{$x}" y2="{$y}" xmlns="http://www.w3.org/2000/svg"
                  style="stroke:#ebf442;stroke-width:3;"/>
        </xsl:if>
        <xsl:if test="$sign = 1">
            <line x1="{$xpos}" y1="{$ypos}" x2="{$x}" y2="{$y}" xmlns="http://www.w3.org/2000/svg"
                  style="stroke:#f441cd;stroke-width:2;"/>
        </xsl:if>


        <!--  Color for registered, unregistered and signed in user -->
        <xsl:if test="$reg=1 and $sign=0"> <!--default-->
            <rect width="200" height="200" x="{$x - 100}" y="{$y - 100}" rx="{$radius}" ry="{$radius}"
                  xmlns="http://www.w3.org/2000/svg"
                  style="fill:#41dff4;stroke:black;stroke-width:1;opacity:1.0;cursor:pointer;"
                  onclick="{$onExpandAccountBox}"/>
        </xsl:if>
        <xsl:if test="$reg=1 and $sign=1"> <!-- Main user -->
            <rect width="200" height="200" x="{$x - 100}" y="{$y - 100}" rx="{$radius}" ry="{$radius}"
                  xmlns="http://www.w3.org/2000/svg"
                  style="fill:#f441cd;stroke:black;stroke-width:1;opacity:1.0;cursor:pointer;"
                  onclick="{$onExpandAccountBox}"/>
        </xsl:if>
        <xsl:if test="$reg=0 and $sign=0">
            <rect width="200" height="200" x="{$x - 100}" y="{$y - 100}" rx="{$radius}" ry="{$radius}"
                  xmlns="http://www.w3.org/2000/svg"
                  style="fill:#f4e241;stroke:black;stroke-width:1;opacity:1.0;cursor: pointer;"
                  onclick="{$onExpandAccountBox}"/>
        </xsl:if>


        <rect width="200" height="170" x="{$x - 100}" y="{$y - 100}" rx="{$radius}" ry="{$radius}"
              xmlns="http://www.w3.org/2000/svg"
              style="fill:#eee;stroke:black;stroke-width:1;opacity:1.0;cursor:pointer;"
              onclick="{$onExpandMap}"/>
        <text x="{$x}" y="{$y + 90}" fill="black" xmlns="http://www.w3.org/2000/svg" width="200" text-anchor="middle"
              style="pointer-events:none;cursor:pointer;" onclick="{$onExpandAccountBox}">
            <xsl:value-of select="$name"/><!--$name-->
        </text>
        <line x1="{$x -100}" y1="{$y + 70}" x2="{$x + 100}" y2="{$y + 70}" style="stroke:rgb(0,0,0);stroke-width:2"
              xmlns="http://www.w3.org/2000/svg"/>
        <image xlink:href="https://use.fontawesome.com/releases/v5.1.0/svgs/solid/expand.svg" x="{$x + 74}"
               y="{$y + 74}" width="24" height="24" xmlns="http://www.w3.org/2000/svg"
               xmlns:xlink="http://www.w3.org/1999/xlink" style="cursor:pointer;" onclick="{$onExpandAccountBox}"/>
        <image xlink:href="{concat($fileprefix, $id)}" x="{$x - 90}" y="{$y - 90}" height="150px" width="180px"
               xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
               style="cursor:pointer;" onclick="{$onExpandMap}"/>

    </xsl:template>

    <xsl:template match="name">
        <xsl:apply-templates/>
    </xsl:template>


</xsl:stylesheet>
