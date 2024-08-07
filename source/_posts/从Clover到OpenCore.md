---
title: 从Clover到OpenCore
date: 2021-10-10 05:46:25
categories: [默认分类,技术笔记]
tags: [技术笔记,随笔]
---



[![img](from-clover-to-opencore.png)](from-clover-to-opencore.png)

> 由于是转载文章，文章中的`我`特指作者：[SukkaW](https://github.com/SukkaW)

随着 `OpenCore` 日渐成熟、[acidanthera](https://github.com/acidanthera) 团队宣布放弃旗下绝大部分内核驱动（包括 [Lilu](https://github.com/acidanthera/Lilu)、[VirtualSMC](https://github.com/acidanthera/VirtualSMC)、[WhateverGreen](https://github.com/acidanthera/WhateverGreen)、[AppleALC](https://github.com/acidanthera/AppleALC) 等）对 `Clover` 的兼容性支持，与其届时被迫换到 `OpenCore`，不如主动开始迁移。



当然面对迁移，有的人会选择直接抛弃之前 `Clover` 的全部成果，直接从零开始配置 `OpenCore`。但是我相信对于大部分人来说更希望通过简简单单的修补，在现有的 EFI 的基础上迁移到 `OpenCore`，因此我开始撰写这篇文章。

然而不幸的是从 `Clover` 切换到 `OpenCore` 并不是一个简单的任务，因此这种迁移应该是渐进式的，不可能一蹴而就。那什么是「渐进式」呢？意思就是，如果你按照本文的步骤一步一步按顺序进行，那么大部分迁移步骤产生的修改，在 `Clover` 下一样可用，你不需要一下子就扔掉 `Clover` 。

## 序言以外应该写在最前面的话

1. `OpenCore` 丢掉了不少 `Clover` 的历史包袱。毫无疑问依然有不少 `Clover` 设置在 `OpenCore` 是没有可以直接替代的。因此 `Clover` 完全照搬到 `OpenCore` 是肯定行不通的。
2. 在迁移到 `OpenCore` 之前，Clover 的大部分设置都要精简：用 `SSDT` 代替、改为注入设备属性（Device Properties）。这篇教程的主题就是教你这些事情。
3. 如果你一开始在组织 `Clover` 的 EFI 时就有洁癖的话，你会发现迁移到 `OpenCore` 出人意料地简单。
4. 只有完美的 `Clover` 的 EFI，在按照本文档的步骤精简后能获得完美的 `OpenCore` 的 EFI。如果你的 EFI 是不完美的，那么迁移到 `OpenCore` 也一定是不完美的。因此，如果你是为了解决不完美、才想迁移到 `OpenCore`，那么我建议先在 `Clover` 下完善。
5. 独木难成林。这篇教程初次发布以后，[Bat.bat](https://github.com/williambj1) 等许多大佬在远景论坛、Telegram 上提供了许多意见，正是在他们的帮助下，这篇教程得以不断完善。

## 修改 `SSDT` / `DSDT` 以搭配 `OpenCore`

`OpenCore` 和 `Clover` 最大的不同其实是，[acidanthera](https://github.com/acidanthera) 决定在 `OpenCore` 中设置的 SMBIOS 机型信息、DSDT 和 SSDT，都将一视同仁的对所有操作系统生效。这样做的目的是让黑苹果更像白苹果，但是却有可能导致在 macOS 上正常可用的 ACPI 表到了 Windows 上反而会出问题。因此，迁移的第一步我个人推荐从修改现有的 `SSDT` 和 `DSDT` 开始，因为在 `OpenCore` 下能用的 SSDT、DSDT，在 `Clover` 下是一定可用的。也就是说，当你完成这一步后，你可以继续使用 `Clover` 而不受影响。

这里主要介绍对 `Method` 函数的修改方法。以 GPRW（6D0D）补丁为例，在 `Clover` 上我们一般采用这种方法：

```
//
// In config ACPI, GPRW to XPRW
// Find:     47505257 02
// Replace:  58505257 02
//
DefinitionBlock ("", "SSDT", 2, "SUKA", "GPRW", 0)
{
    External(XPRW, MethodObj)
    Method (GPRW, 2, NotSerialized)
    {
        If ((0x6D == Arg0))
        {
            Return (Package ()
            {
                0x6D, 
                Zero
            })
        }

        If ((0x0D == Arg0))
        {
            Return (Package ()
            {
                0x0D, 
                Zero
            })
        }
        Return (XPRW (Arg0, Arg1))
    }
}
```

这个 `SSDT` 的原理是，通过 `DSDT` 重命名将原始的 `GPRW,2` 函数重命名为 `XPRW,2` ，然后通过 `SSDT` 新增一个 `GPRW` 函数，这样实际 ACPI 调用 GPRW 函数时就是调用的 `SSDT` 里添加的 GPRW 函数。

但是现在，`OpenCore` 将会对所有操作系统一视同仁，所有 SSDT、DSDT 重命名对包括 Windows 在内的所有操作系统生效，那么 `SSDT` 中的 GPRW 函数也会在 Windows 生效，可能就会导致未知的后果。所以，我们需要通过 `OSI` 函数，判断当前操作系统，确保函数的行为只对某一个操作系统生效：

```
//
// In config ACPI, GPRW to XPRW
// Find:     47505257 02
// Replace:  58505257 02
//
// 需要注意的是，ACPI 里不支持非 ASCII 字符注释，这里仅做示例，不可直接用于编译
DefinitionBlock ("", "SSDT", 2, "OCLT", "GPRW", 0)
{
    External(XPRW, MethodObj) // 对 XPRW 函数的外部引用
    Method (GPRW, 2, NotSerialized)
    {
        If (_OSI ("Darwin")) // 如果当前的操作系统是 macOS，生效以下行为
        {
            If ((0x6D == Arg0))
            {
                Return (Package ()
                {
                    0x6D, 
                    Zero
                })
            }

            If ((0x0D == Arg0))
            {
                Return (Package ()
                {
                    0x0D, 
                    Zero
                })
            }
        }
        // 否则，直接返回 XPRW 函数。只有三种情况下会走到这一步：
        // 第一个参数不是 0x6D、第一个参数不是 0x0D、当前操作系统不是 macOS
        // XPRW 是 ` DSDT ` 中原始的 GPRW 函数重命名而来
        // 所以这一步实际上是调用了原始 ` DSDT ` 中原始的 GPRW 方法
        Return (XPRW (Arg0, Arg1))
    }
}
```

上面以 GPRW 为例介绍了相关思路，接下来我们以亮度快捷键补丁为例实际操作一下如何一步一步修改 SSDT。大部分亮度快捷键都是基于 EC Query 触发的，因此在 `Clover` 中我们的亮度快捷键 `SSDT` 可能是这样的：

```
// In config ACPI, _Q14 renamed XQ14
// Find:     5F 51 31 34
// Replace:  58 51 31 34

// In config ACPI, _Q15 renamed XQ15
// Find:     5F 51 31 35
// Replace:  58 51 31 35

DefinitionBlock("", "SSDT", 2, "SUKA", "BrightFN", 0)
{
    External(_SB.PCI0.LPCB.KBD, DeviceObj)
    External(_SB.PCI0.LPCB.EC, DeviceObj)
    
    Scope (_SB.PCI0.LPCB.EC)
    {
        Method (_Q14, 0, NotSerialized)//up
        {
            Notify(\_SB.PCI0.LPCB.KBD, 0x0406)
        }
    
        Method (_Q15, 0, NotSerialized)//down
        {
            Notify(\_SB.PCI0.LPCB.KBD, 0x0405)
        }
    }
}
```

> 如果想知道亮度快捷键补丁的工作原理，请参看我的另一篇文章「[黑苹果自定义键盘 Fn 快捷键](https://blog.skk.moe/post/ssdt-map-fn-shortcuts/)」。

根据同样的思路，我们先在 Method 定义中添加 `OSI` 函数判断操作系统：

```
DefinitionBlock("", "SSDT", 2, "hack", "BrightFN", 0)
{
    External(_SB.PCI0.LPCB.KBD, DeviceObj)
    External(_SB.PCI0.LPCB.EC, DeviceObj)
    
    Scope (_SB.PCI0.LPCB.EC)
    {
        Method (_Q14, 0, NotSerialized)//up
        {
+            If (_OSI ("Darwin"))
+            {
                  Notify(\_SB.PCI0.LPCB.KBD, 0x0406)
+            }
        }
    
        Method (_Q15, 0, NotSerialized)//down
        {
+            If (_OSI ("Darwin"))
+            {
                  Notify(\_SB.PCI0.LPCB.KBD, 0x0405)
+            }
        }
    }
}
```

由于这里不是以 Return 结束的，所以我们要为 `If` 加上 `Else`：

```
DefinitionBlock("", "SSDT", 2, "hack", "BrightFN", 0)
{
    External(_SB.PCI0.LPCB.KBD, DeviceObj)
    External(_SB.PCI0.LPCB.EC, DeviceObj)

    Scope (_SB.PCI0.LPCB.EC)
    {
        Method (_Q14, 0, NotSerialized)//up
        {
+            If (_OSI ("Darwin"))
+            {
                  Notify(\_SB.PCI0.LPCB.KBD, 0x0406)
+            } Else {
+
+            }
        }
    
        Method (_Q15, 0, NotSerialized)//down
        {
+            If (_OSI ("Darwin"))
+            {
                  Notify(\_SB.PCI0.LPCB.KBD, 0x0405)
+            } Else {
+
+            }
        }
    }
}
```

在 `Else` 区域中，调用原始 `DSDT` 中原始的 `_Q14`、`_Q15` 函数、也就是现在已经被重命名为 `XQ14` 和 `XQ15` 的函数。当然，别忘了在文件头部添加对 `XQ14` 和 `XQ15` 的函数的外部引用：

```
DefinitionBlock("", "SSDT", 2, "hack", "BrightFN", 0)
{
    External(_SB.PCI0.LPCB.KBD, DeviceObj)
    External(_SB.PCI0.LPCB.EC, DeviceObj)
+    External(_SB.PCI0.LPCB.EC.XQ14, MethodObj)
+    External(_SB.PCI0.LPCB.EC.XQ15, MethodObj)
    
    Scope (_SB.PCI0.LPCB.EC)
    {
        Method (_Q14, 0, NotSerialized)//up
        {
+            If (_OSI ("Darwin"))
+            {
                  Notify(\_SB.PCI0.LPCB.KBD, 0x0406)
+            } Else {
+                  \_SB.PCI0.LPCB.EC.XQ14()
+            }
        }
    
        Method (_Q15, 0, NotSerialized)//down
        {
+            If (_OSI ("Darwin"))
+            {
                  Notify(\_SB.PCI0.LPCB.KBD, 0x0405)
+            } Else {
+                  \_SB.PCI0.LPCB.EC.XQ15()
+            }
        }
    }
}
```

这样就大功告成了。

是不是有些头昏脑涨？实际上，和 `Clover` 现成的 `SSDT` 补丁库一样，`OpenCore` 也有现成的 `SSDT` 补丁库 [OC-little](https://github.com/daliansky/OC-little)，由资深黑苹果爱好者们维护。我也在其中贡献了一些补丁（如 PTWSAK 关机变重启修复）和说明。 你在 `Clover` 中使用的 `SSDT` 补丁，大部分都有对应的 `OpenCore` 下可用的 `SSDT` 替代，免去了你手动修改的痛苦。而且，你还可能通过 OC-little 库里的其他补丁修复了一些你之前的 `SSDT` 补丁没有解决的问题。

当然，对于一些 OC-little 中没有等价替代的补丁，你仍然需要手动修改、添加操作系统判断；对于直接修补的 DSDT，你也只能自己在 `Method` 中添加对应的判断。

如果你完成了对 SSDT、DSDT 的修改，现在备份你的 EFI、然后修改后的 SSDT、DSDT 放到 `EFI/Clover/ACPI/patched` 之中，然后以 `-v` 重启，看看能不能正常开机。如果可以正常开机，登录以后打开终端执行以下命令、查看日志中是否包括 ACPI Error：

```
$ log show --last boot | grep -Ei "ACPI"
```

如果正常开机，没有 ACPI Error，那么恭喜你，你已经迈出了向 `OpenCore` 迁移的第一步，而且此时你依然还在继续使用 `Clover` ，你的黑苹果没有收到任何影响。

## 减少不必要的 `DSDT` 重命名

[acidanthera](https://github.com/acidanthera) 团队认为，应该尽可能减少 `DSDT` 重命名、减少改动以避免对设备硬件造成伤害。

以下是一些不再需要的重命名，你可以参考这个表自己精简 `DSDT` 重命名、使用 `SSDT` 代替：

- `EHC1 to EH01` 和 `EHC2 to EH02` ：建议由 `OpenCore` 官方的 [`SSDT-EHCx_OFF`](https://github.com/[acidanthera](https://github.com/acidanthera)/OpenCorePkg/blob/master/Docs/AcpiSamples/SSDT-EHCx_OFF.dsl) 关闭 EHC 控制器。Skylake 这类六代以上已经没有 EHC 控制器了，可以直接删除。
- `SAT0 to SATA` 和 `SAT1 to SATA` ：实质上完全没用。
- `HECI to IMEI`、`HEC1 to IMEI`、`MEI to IMEI` 和 `IDER to MEID`：WhateverGreen 能够处理这个问题。
- `GFX0 to IGPU`、`PEG0 to GFX0`、`PEGP to GFX0` 和 `SL01 to PEGP`：WhateverGreen 能够处理这个问题。
- `EC0 to EC`、`H_EC to EC`、`ECDV to EC` 和 `PGEC to EC` ：虽然 macOS 的 USB 电源管理需要名称为 `EC` 的控制器，但是你完全可以在 OC-little 中找到「仿冒 EC」的相关 `SSDT` 补丁。
- `HDAS to HDEF`、`CAVS to HDEF` 和 `AZAL to HDEF` ：AppleALC 能够处理这个问题，除非你在用 VoodooHDA 万能声卡。
- `STAS to Noop` ：建议由 OC-little 中的 `SSDT-AWAC` 相关补丁替代。

> 经 [Bat.bat](https://github.com/williambj1) 大佬指出，由于新的时钟设备 AWAC 的普及，用 Noop 会导致同时启用两个时钟设备，在 macOS 下只有一个能正常工作、但是在 Windows 下面暴露两个设备无疑对系统有害，同时也严重违反 ACPI 规范。`STAS` 这个变量的意义使 AWAC 和 RTC 互锁以避免这种危害。因此，使用 `SSDT-AWAC` 是更理想的办法。

- `PXSX to ANS1` 和 `PXSX to ANS2` ：建议用 [NVMeFix](https://github.com/[acidanthera](https://github.com/acidanthera)/NVMeFix) 这个 kext 修复 NVMe SSD 的电源管理。
- `LPC0 to LPCB` ：如果你要添加 SMBUS 支持，OC-little 中分别有 SBUS 的 `SSDT` 注入补丁和 MCHC 设备补丁。

> 顺便提醒一下，使用 OC-little 的补丁的时候，需要注意设备的原始 `DSDT` 中的 LPC 总线名称，并且要自己修改 `SSDT` 以使 LPC 总线匹配。

- `PC00 to PCIO`、`FPU to MATH`、`TMR to TIMR`、`GBE1 to ETH0` 和 `PIC to IPIC` ：这些重命名也是实质上是完全没用的。
- `_OSI to XOSI` 和 `OSID to XSID` ：除非你的某些硬件设备只能在 Windows 下工作（比如 I2C 触摸板只能在 Windows 下使用，再比如 ThinkPad 对 FreeBSD 的特殊优化），否则完全没有必要使用 `SSDT-XOSI` 补丁来伪装操作系统。而且大部分情况下，直接定制 `SSDT` 也可以解除某些硬件的操作系统限制。

> 关于「定制 `SSDT` 以解除限制」，Bat.bat 大佬做了一些说明：一种方法是通过「预置变量法」（详见 OC-little 的「总述」章节）禁用原始设备的函数如 `_STA`，另一种方法是通过重命名实现对相关 `_STA` 的函数的精确重命名，然后通过 `SSDT` 添加新的 `_STA` 函数（SSDT 中可以添加 `OSI` 操作系统判断函数）。

- `_DSM to XDSM` ：首先遍历一下你的 `SSDT` 补丁中没有依赖 `_DSM` 的，如果没有，这个重命名也应该删除，因为这个重命名涉及的范围实在太大了、太过于危险。

我的建议是，尽可能只添加和 `Method` 名称有关的重命名（如 `GPRW to XPRW`、`_Q14 to XQ14`），而且随后要通过 `SSDT` 确保在非 macOS 操作系统下要调用并返回原始函数，确保在非 macOS 操作系统下的原始 `DSDT` 行为不会被改变。如果万不得已要添加其它重命名（如通过重命名禁用某些设备），那么就要权衡这一重命名的后果。

如果你完成了精简 `DSDT` 重命名并保存了 config，接下来的操作还是一样的，备份原始 EFI、然后以 `-v` 重启，看看能不能正常开机。如果可以正常开机，登录以后打开终端执行以下命令、查看日志中是否包括 ACPI Error：

```
$ log show --last boot | grep -Ei "ACPI"
```

完成这一步，你依然没有必要离开 `Clover` 。我说过了，「渐进式」地迁移，嗯？

## 摆脱对 `Clover` ACPI Quirks 的依赖

Clover 实在是非常方便。一个开关，关机变重启就修复了；三个开关，HPET、IRQ、TIMR 就修复了；等等等等。但是 `OpenCore` 是没有内置这些 ACPI 修复的，所以在 `Clover` 下用开关实现的 ACPI 修复现在都必须用 `SSDT` 实现。所幸的是，我们依然可以从 OC-little 里找到绝大部分我们需要的补丁。

- `FixIPIC`：参考 OC-little 的「声卡 IRQ 补丁」章节
- `FixSBUS`：参考 OC-little 的「注入 SBUS 设备」
- `FixShutdown`：参考 OC-little 的「PTSWAK 综合补丁章节」，需要添加其中的 EXT1 插件补丁（该补丁由我贡献）
- `FixDisplay`：使用 WhateverGreen 和定制缓冲帧补丁解决
- `AddMCHC`：参考 OC-little 的「注入缺失的 MCHC」章节
- `FixHDA`：使用 AppleALC 即可
- `FixHPET`：参考 OC-little 的「声卡 IRQ 补丁」章节
- `FixSATA`：这个先不管它，`OpenCore` 中有个 `ExternalDiskIcons` 的 Quirk，也可以使用 `innie.kext` 解决。
- `FixADP1`：使用 `DSDT` 重命名 `AC0_ to ADP1`，可能还要额外注入 `Name (_PRW, Package (0x02) {0x1C,0x03})`。
- `FixRTC`：参考 OC-little 的「声卡 IRQ 补丁」章节
- `FixTIMR`：参考 OC-little 的「声卡 IRQ 补丁」章节
- `AddPNLF`：参考 OC-little 的「注入 PNLF」章节
- `AddIMEI`：使用 WhateverGreen 即可
- `FixIntelGfx`：使用 WhateverGreen 即可
- `AddHDMI`：使用 WhateverGreen 即可

除了这些开关以外，Clover 还有一些其它的 ACPI 设定，也有与之对应的替代。

- `DisableASPM`：没有很好的代替方法，可以在设备属性（DeviceProperties）中分别添加相关设备的 PCI 总线位置并注入属性 `pci-aspm-default | DATA | <00>`。
- `PluginType`：参考 OC-little 的「注入 X86」章节
- `Generate P States` 和 `Generate C States`：这些是六代以前 CPU 才需要的设置，可以用 [ssdtPRGen.sh](https://github.com/Piker-Alpha/ssdtPRGen.sh) 生成对应的 SSDT。

当然之后的事情还是一样的，以 `-v` 重启，正常开机后打开终端查看日志中是否包括 ACPI Error：

```
$ log show --last boot | grep -Ei "ACPI"
```

当你把所有 `Clover` 的开关都用 `SSDT` 代替以后，你离迁移到 `OpenCore` 就越来越近了。

## 更新设备属性

### 使用缓冲帧补丁驱动 Intel 核显

如果你还在用 `Clover` 的 InjectIntel 的方式来驱动 Intel 核显的话，是时候更换到 WhateverGreen 和缓冲帧补丁的方式了。

建议参考以下几篇文章：

- [使用 WhateverGreen 驱动 Intel 核显 | 醉渔小站](https://blog.zuiyu1818.cn/posts/Hac_Intel_Graphics.html)
- [Hackintool(原Intel FB-Patcher)使用教程及插入姿势 | 黑果小兵的部落阁](https://blog.daliansky.net/Intel-FB-Patcher-tutorial-and-insertion-pose.html#核心功能给缓冲帧打补丁)
- [Intel 核显驱动常见问题 | WhateverGreen](https://github.com/[acidanthera](https://github.com/acidanthera)/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md) （务必看英文版，中文翻译严重过时）

### 新的声卡 layout-id 注入方式

大部分黑苹果的声卡教程都已经推荐此处留空、直接在设备属性中注入 layout-id 了，不过我还是再冗笔一下。

下载 [acidanthera](https://github.com/acidanthera) 开发的工具 [gfxutils](https://github.com/[acidanthera](https://github.com/acidanthera)/gfxutil/releases)，使用下述命令找出声卡的 PCI 总线位置：

```
$ path/to/gfxutils -f HDEF
$ path/to/gfxutils -f HDAS
$ path/to/gfxutils -f HDAU
```

然后在设备属性中添加 PCI 总线位置、注入 `layout-id` 属性。

至于 `AFGLowPowerState`，需要额外为声卡设备注入 `AFGLowPowerState` 属性，值为 `DATA | <01000000>`、至于 `ResetHDA`，推荐安装 [JackFix](https://github.com/fewtarius/jackfix)。

## 开始组织 `OpenCore` 目录

终于是时候了，所有的准备工作都做完了！你可以抽出一天（最好占卜一下是否是吉日），沐浴更衣，然后开始组织你的 `OpenCore` 目录。

### 下载 `OpenCore` 所需文件

- [OpenCorePkg](https://github.com/[acidanthera](https://github.com/acidanthera)/OpenCorePkg/releases) - `OpenCore` 本体、一些 `SSDT` 补丁、目录结构

- [MacInfoPkg](https://github.com/[acidanthera](https://github.com/acidanthera)/MacInfoPkg/releases) - 导出你当前的三码、以及生成新的三码

- [AppleSupportPkg](https://github.com/[acidanthera](https://github.com/acidanthera)/AppleSupportPkg/releases) - 包括三个 EFI 驱动，`ApfsDriverLoader`、`VBoxHfs`、`AudioDxe`

- OcBinaryData

   

  \- 包含两个闭源驱动

   

  ```
  HfsPlus.efi
  ```

   

  和

   

  ```
  ExFatDxe.efi
  ```

  ，以及

   

  ```
  OpenCore
  ```

   

  官方主题的图标文件。

  - 非常推荐安装 `OpenCore` 官方做的主题，和真 Mac 的 BootPicker 一模一样（除了没有网络图标）。不过那可能是另一篇文章的主题了。

### 决定你使用的配置文件编辑器

- [ProperTree](https://github.com/corpnewt/ProperTree)：一个 Python 编写的 plist 编辑器，专门优化了 `OpenCore` 和 `Clover` 配置文件编写。

- Xcode：非常不推荐，Xcode 11 不仅花里胡哨、而且处理 plist data 和大整数方面存在问题。

  - 简单来说，Apple 没有再开放旧版的 Xcode 10 下载、而且 Apple 的 CDN 还有防盗链。因此如果我要写一篇从 Apple 官方下载 Xcode 10 的教程，那么会比你现在看的这篇的「从 `Clover` 到 `OpenCore`」要长得多。
  - 如果你和我一样成功下载了 Xcode 10 或者就没有升级到 Xcode 11：我刚才什么都没写，你什么都没看见。

- `OpenCore` Configurator

  ：Clover Configurator 作者的新作品。很适合新手使用。

  - `OpenCore` 的配置文件变更非常频繁，因此只应该用 **最新版的 `OpenCore` Configurator** 搭配 **最新的正式版的 `OpenCore`**，否则配置文件格式错误将会导致无法引导。
  - `OpenCore` Configurator 有不少低级 Bug（后来更新时都修复了），比如之前有一个版本，在应对 `VoodooPS2Controller` 和 `VooooI2C` 这种嵌套 kext 时，会只添加内部 kext 的 `dsYM` 签名文件、却不添加内部 kext 本体。
  - 反正就是，使用后果自负。

### 生成目录结构

解压下载的 `OpenCore` 并解压，将其中的 EFI 目录 **复制出来到别处**。

> 直到配置好以后，再将这个目录合并进硬盘上的 EFI 分区。

将 Docs 目录下的 `Sample.list` 复制到 `EFI/OC` 目录下、并重命名为 `config.plist`。

> 如果你下载的是 `OpenCore` 0.5.7 版本，还需要额外将 `Reources` 目录复制到 `EFI/OC` 目录之中。

解压下载的 AppleSupportPkg，将其中的 Drivers 目录和 Tools 目录中的文件复制到 `EFI/OC/Drivers` 目录和 `EFI/OC/Tools` 目录中。

解压下载的 OcBinaryData，将其中 Drivers 目录复制到 `EFI/OC/Drivers` 目录中。

### 删除不需要的文件

删除 Drivers 目录中的这些文件：

- `ExFatDxe` 和 `ExFatDxeLegacy`：除非你的 EFI 分区或者某个系统分区是 ExFAT 分区格式的，否则不需要保留。
- `HfsPlus`、`HfsPlusLegacy` 和 `VBoxHfs`：三者只要留其中一个即可。一般推荐用 HfsPlus，比 VBoxHfs 速度快三倍。在四代以前机型上应该用 HfsPlusLegcay 而不是 HfsPlus。
- `AppleUsbKbDxe` 或 `OpenUsbKbDxe`：这是为三代以前机型使用的，现代的机器应该使用 `OpenCore` 中的 `KeySupport` 这个 Quirk。
- `NvmExpressDxe`：这是为四代以前机型使用的 NVMe 硬盘加载驱动，现代的机器已经不需要了。
- `XhciDxe`：为二代以前的主板提供 XHCI 支持的，现代的机器已经不需要了。
- `HiiDatabase`：为四代以前的设备提供 UEFI 界面字体渲染支持的，现代的机器已经不需要了。

删除 Tools 目录中的这些文件：

- `BootKicker`：调用 Mac 内置的引导界面，是用于给白苹果安装 `OpenCore` 时用的，黑苹果用不上。

------

现在，你的 `OpenCore` EFI 目录的结构应该是这样的：

```
EFI
├── BOOT
│   └── BOOTx64.efi
└── OC
    ├── ACPI
    ├── Drivers
    │   ├── ApfsDriverLoader.efi
    │   ├── AudioDxe.efi
    │   ├── HfsPlus.efi
    │   ├── OpenCanopy.efi
    │   └── OpenRuntime.efi
    ├── Kexts
    ├── OpenCore.efi
    ├── Resources
    └── Tools
        ├── ChipTune.efi
        ├── ......
        └── VerifyMsrE2.efi
```

现在，你可以把你的 SSDT、DSDT 从 `Clover` 里的 `Clover/ACPI/Patched` 复制出来、粘贴进 `EFI/OC/ACPI` 目录中；将 Kext 从 `Clover/Kexts/*/` 中复制出来粘贴进 `EFI/OC/Kexts` 目录中。

## 开始配置 `OpenCore`

这里我就不再赘述 `OpenCore` 的配置教程了。这里推荐几个写的不错的教程和足够有用的参考资料。

- `OpenCore` 参考文档。当你解压下载的 `OpenCore` 时，`Docs/Configuration.pdf` 文件就是 `OpenCore` 的官方文档。这是最权威的 `OpenCore` 参考资料、没有之一。
- [`OpenCore` 简体中文参考手册](https://oc.skk.moe/)。`OpenCore` 参考手册的翻译，由我和一些黑苹果爱好者们共同在维护。

> 上面两份参考资料资料适合你在配置时不知道某个选项的具体作用、具体副作用时参考用，但是不适合直接对着它们配置 `config.plist`。
> 如果想要快速上手 `OpenCore` 配置，应该参考下面的教程：

- [`OpenCore` Vanilla Guide](https://khronokernel-2.gitbook.io/opencore-vanilla-desktop-guide/)。`OpenCore` 官方认可写得较好的新手教程。这篇教程受众是第一次接触黑苹果就想用 `OpenCore` 的人，因此内容写得非常浅显
- [精解 `OpenCore` | 黑果小兵的部落阁](https://blog.daliansky.net/OpenCore-BootLoader.html#配置-opencore)。国内最早的 `OpenCore` 介绍文档之一，提供了不少配置思路和 Quirks 的推荐配置。
- [使用 `OpenCore` 引导黑苹果 | XJN’s Blog](https://blog.xjn819.com/?p=543)。比较详细的 `OpenCore` 配置介绍，但是这篇文章的排版我实在是欣赏不来。
- [`OpenCore` 引导迁移折腾记录 | 宇宙よりも遠い場所](https://kirainmoe.com/blog/post/opencore-migration-experience/#13-修改-configplist)。内容详细的 `OpenCore` 配置介绍，提供了不少 Quirks 的推荐配置。

Clover 中的部分配置，如 `DSDT` 重命名，由于在之前已经精简，因此可以将 Find 和 Replace 的十六进制字符串逐对复制到 `OpenCore` 的配置文件中。

## Clover 中的设置在 `OpenCore` 的等效配置

现在你开始跟着我推荐的教程和参考资料开始配置 `OpenCore` 了。接下来我会写一些 `Clover` 中一些选项在 `OpenCore` 的对应等效配置，在配置 `OpenCore` 时别忘了跟着看看。

### Boot 的相关设置

- 引导参数：`OpenCore` 中 `NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82 -> boot-args`

- ```
  NeverHibernate
  ```

  ：

  ```
  Misc -> Boot -> HibernateMode -> None
  ```

  - 其实不再建议禁用休眠，由于 `OpenCore` 的行为和白苹果更加接近，以至于已经可以实现 macOS 的完美休眠。

- Default Boot Volume：

  ```
  OpenCore
  ```

   

  中

   

  ```
  Misc - Security - AllowSetDefaults - true
  ```

  - 然后在 `OpenCore` 的引导菜单处使用 Ctrl + Enter 按键进行选择
  - 你也可以直接用「系统偏好设置」中的「启动磁盘」设置

- DefaultBackgroundColor：`OpenCore` 中的 `NVRAM -> Add -> 4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14-> DefaultBackgroundColor` ，需要自己将 RGB 转换为 HEX。

- EFILoginHiDPI：

  ```
  OpenCore
  ```

   

  中

   

  ```
  NVRAM -> Add -> 4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14 -> EFILoginHiDPI | Data | <>
  ```

  - 0 -> `<00000000>`
  - 1 -> `<01000000>`

- flagstate：

  ```
  OpenCore
  ```

   

  中

   

  ```
  NVRAM -> Add -> 4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14 -> flagstate | Data | <>
  ```

  - 0 -> `<00000000 00000000 00000000 00000000 00000000 00000000 00000000 00000000>`
  - 注意自行判断 NVRAM 键值对位置

- UIScale：

  ```
  NVRAM -> Add -> 4D1EDE05-38C7-4A6A-9CC6-4BCCA8B38C14 -> UIScale | Data | <>
  ```

  - 1 -> `<01>`
  - 2 -> `Data | <02>`

### CPU 相关配置

- Type：在

   

  ```
  OpenCore
  ```

   

  中有对应的

   

  ```
  Platforminfo -> SMBIOS -> ProcessorType
  ```

   

  可以设置处理器类型

  - 在 [这个文件](https://github.com/[acidanthera](https://github.com/acidanthera)/EfiPkg/blob/master/Include/IndustryStandard/AppleSmBios.h) 查看可以选用的值

- HWPEnable：如果你真的要依赖 `MSR 0x770` （注意这里说的不是原生电源管理 `MSR 0xe2`）的 HWP 电源管理，建议安装 headkaze 开发的 [`HWPEnable.kext`](https://github.com/headkaze/HWPEnable/tree/master/binary)。HackinTool 也是他开发的。

- QEMU：`OpenCore` 已经完整支持虚拟机，因此 `OpenCore` 中不包含这一选项。

- TurboDisable：建议用 CPUFriend 或者 [ssdtPRGen.sh](http://ssdtprgen.sh/) 来修复电源管理。

### 设备属性相关设置

#### USB

- FixOwnership：`OpenCore` 中 `UEFI -> Quirk -> ReleaseUsbOwnership`

- ClockID：需要自己注入对应的设备属性（Device Properties），属性为 `AAPL,clock-id`

- HighCurrent：需要自己注入对应的设备属性（Device Properties），属性为

   

  ```
  AAPL,HighCurrent
  ```

  - 对于 macOS 10.11 来说 HighCurrent 已经没啥用了。对于更新版的 macOS，推荐用 OC-little 中的 `SSDT-USBX` 补丁。

#### FakeID

同样使用 gfxutils 工具找到 PCI 总线位置，然后分别注入相关属性：

- USB

  - `device-id`
  - `device_type`
  - `device_type`

- IMEI

  - `device-id`
  - `vendor-id`

- WIFI

  - `name`
  - `compatible`

- LAN

  - `device-id`
  - `compatible`
  - `vendor-id`

- XHCI

  - `device-id`

  - `device_type: UHCI`

  - `device_type: OHCI`

  - ```
    device_type: EHCI
    ```

    - `device-id`
    - `AAPL,current-available`
    - `AAPL,current-extra`
    - `AAPL,current-available`
    - `AAPL,current-extra`
    - `AAPL,current-in-sleep`
    - `built-in`

  - ```
    device_type: XHCI
    ```

    - `device-id`
    - `AAPL,current-available`
    - `AAPL,current-extra`
    - `AAPL,current-available`
    - `AAPL,current-in-sleep`
    - `built-in`

### Clover 中相关的图形设置

和前文一样，这些在 `Clover` 中设置的属性都需要改为注入对应的设备属性即可。

- InjectAti

  :

  - `DeviceProperties -> Add -> PCIRoot... -> deviceID`
  - `DeviceProperties -> Add -> PCIRoot... -> Connectors`

- InjectNvidia

  :

  - `DeviceProperties -> Add -> PCIRoot... -> DeviceID`
  - `DeviceProperties -> Add -> PCIRoot... -> Family`

- FakeAti

  :

  - `DeviceProperties -> Add -> PCIRoot... -> device-id`
  - `DeviceProperties -> Add -> PCIRoot... -> ATY,DeviceID`
  - `DeviceProperties -> Add -> PCIRoot... -> @0,compatible`
  - `DeviceProperties -> Add -> PCIRoot... -> vendor-id`
  - `DeviceProperties -> Add -> PCIRoot... -> ATY,VendorID`

- BootDisplay

  :

  - `DeviceProperties -> Add -> PCIRoot... -> @0,AAPL,boot-display`

> Intel 核显推荐使用 WhateverGreen 和缓冲帧补丁驱动。

一般的，在注入仿造显卡或仿造 VBIOS 的时候，更推荐使用 `SSDT` 搭配 WhateverGreen 的方式。至于 EDID 注入，WhateverGreen 的文档中有 [详细介绍](https://github.com/[acidanthera](https://github.com/acidanthera)/WhateverGreen/blob/master/Manual/FAQ.IntelHD.en.md#edid)。

### 内核扩展驱动（Kext）相关

- **KernelPm** 和 **AppleIntelCPUPM**：对应 `OpenCore` 中 `Kernel -> Quirks -> AppleXcpmCfgLock -> YES` 和 `Kernel -> Quirks -> AppleCpuPmCfgLock -> YES`。

- DellSMBIOSPatch

   

  ：在

   

  ```
  OpenCore
  ```

   

  中对应了两个 Quirk：

  - `Kernel -> Quirks -> CustomSMBIOSGuid -> YES`
  - `PlatformInfo -> UpdateSMBIOSMode -> Custom`

- **Kernel LAPIC** 和 **KernelXCPM**：分别对应 `OpenCore` 中的 `Kernel -> Quirks -> LapicKernelPanic -> YES` 和 `Kernel -> Quirks -> AppleXcpmExtraMsrs -> YES`

- AppleRTC

  ：

  - Comment：Disable RTC checksum update on poweroff
  - Enabled：YES
  - Count：1
  - Base：`__ZN8AppleRTC14updateChecksumEv`
  - Identifier：`com.apple.driver.AppleRTC`
  - Limit：0
  - Find：
  - Replace：c3

- **FakeCPUID**：`OpenCore` 提供了专门的 Emulate 功能。

除此以外，一些常用的 Kext Patch 在 `OpenCore` 中也有了对应了 Quirk。

- 解除 USB 15 端口限制，以前根据不同的系统需要打不同的 Kext Patch，现在只需要 `OpenCore` 一个 Quirk：`Kernel -> Quirks -> XhciPortLimit -> YES`

- 内置硬盘变外置硬盘，也只需要一个 Quirk：

  ```
  kernel -> Quirks -> ExternalDiskIcons -> YES
  ```

  - 和前面的 FixSATA 不同，FixSATA 顾名思义只修复 SATA 硬盘，而 `OpenCore` 这个 Quirks 会修复所有的硬盘。

- 为 SATA SSD 提供 TRIM 现在也只需要启用一个 Quirk：`Kernel -> Quirks -> ThirdPartyDrive`

### SMBIOS 机型信息和系统参数

- **Product Name**：`PlatformInfo -> Generic -> SystemProductName`

- **Serial Number**：`PlatformInfo --> Generic -> SystemSerialNumber`

- **Board Serial Number**：`PlatformInfo -> Generic -> MLB`

- **SmUUID**：`PlatformInfo -> Generic -> SystemUUID`

- Slots AAPL Injection

  ：需要注入到设备属性中

  - `DeviceProperties -> Add -> PCIRoot... -> APPL,slot-name | string | Add slot`

- **CustomUUID**：就连 `Clover` 都不推荐配置这一项，`OpenCore` 直接就不提供硬件 UUID 配置功能

- **InjectSystemID**：兼容变色龙的历史遗留配置，`OpenCore` 也不再提供

- BacklightLevel

  ：需要注入到 NVRAM 中

  - `NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82 -> backlight-level | Data | <Insert value>`

- NvidiaWeb

  ：需要注入到 NVRAM 中

  - `NVRAM -> Add -> 7C436110-AB2A-4BBB-A880-FE41995C9F82 -> nvda_drv: <31>`

------

配置好 `OpenCore` 以后，可以将 `OpenCore` 复制到 U 盘或者硬盘中。需要注意的是，`EFI/BOOT/BOOTx64.efi` 需要直接替换。在添加引导项时，`OpenCore` **必须** 从 `EFI/BOOT/BOOTx64.efi` 启动而不是从 `EFI/OC/OpenCore.efi` 启动。如果启动项中添加的不是 `EFI/BOOT/BOOTx64.efi`，那么有很大的概率你会遇到各种奇怪的问题。

## 清理 `Clover` 残余

重启到 `OpenCore` 引导之前，务必清理掉 `Clover` 的残留文件：

```
sudo rm -rf /Library/PreferencePanes/Clover.prefPane # 删除 `Clover` 位于系统偏好设置中的面板
# 删除 `Clover` 的自动脚本
rm -rf "/etc/rc.clover.lib"
rm -rf "/etc/rc.boot.d/10.save_and_rotate_boot_log.local"
rm -rf "/etc/rc.boot.d/20.mount_ESP.local"
rm -rf "/etc/rc.boot.d/70.disable_sleep_proxy_client.local.disabled"
rm -rf "/etc/rc.boot.d/80.save_nvram_plist.local"
rm -rf "/etc/rc.shutdown.local"
rm -rf "/etc/rc.boot.d"
rm -rf "/etc/rc.shutdown.d"
# 删除 `Clover` 的守护进程
launchctl unload '/Library/LaunchDaemons/com.slice.CloverDaemonNew.plist'
rm -rf '/Library/LaunchDaemons/com.slice.CloverDaemonNew.plist'
rm -rf '/Library/Application Support/Clover/CloverDaemonNew'
rm -rf '/Library/Application Support/Clover/CloverLogOut'
rm -rf '/Library/Application Support/Clover/CloverWrapper.sh'
```

除此以外，还要删除 EFI 分区中的 `nvram.plist` 文件。

在 `OpenCore` 中还需要重置 NVRAM。可以在 `OpenCore` 引导菜单中，按下空格键显示隐藏条目，最后一个条目就是 `OpenCore` 的重置 NVRAM 功能。

## 原文链接：

https://blog.skk.moe/post/from-clover-to-opencore/

## 感谢名单

- [Apple](https://www.apple.com/) 的 macOS
- [RehabMan](https://github.com/rehabman)维护的项目：[OS-X-Clover-Laptop-Config](https://github.com/RehabMan/OS-X-Clover-Laptop-Config) [Laptop-DSDT-Patch](https://github.com/RehabMan/Laptop-DSDT-Patch) [OS-X-USB-Inject-All](https://github.com/RehabMan/OS-X-USB-Inject-All)等
- [Acidanthera](https://github.com/acidanthera) 维护的项目：[OpenCorePkg](https://github.com/acidanthera/OpenCorePkg) [lilu](https://github.com/acidanthera/Lilu) [AirportBrcmFixup](https://github.com/acidanthera/AirportBrcmFixup) [WhateverGreen](https://github.com/acidanthera/WhateverGreen) [VirtualSMC](https://github.com/acidanthera/VirtualSMC) [AppleALC](https://github.com/acidanthera/AppleALC) [BrcmPatchRAM](https://github.com/acidanthera/BrcmPatchRAM) [MaciASL](https://github.com/acidanthera/MaciASL) 等
- [headkaze](https://www.insanelymac.com/forum/profile/1364628-headkaze/) 提供的工具：[hackintool](https://github.com/headkaze/Hackintool) [PinConfigurator](https://github.com/headkaze/PinConfigurator) [BrcmPatchRAM](https://www.insanelymac.com/forum/topic/339175-brcmpatchram2-for-1015-catalina-broadcom-bluetooth-firmware-upload/)
- [CloverHackyColor](https://github.com/CloverHackyColor)维护的项目：[CloverBootloader](https://github.com/CloverHackyColor/CloverBootloader) [CloverThemes](https://github.com/CloverHackyColor/CloverThemes)
- 宪武整理的：[P-little](https://github.com/daliansky/P-little) [OC-little](https://github.com/daliansky/OC-little)
- [chris1111](https://github.com/chris1111)维护的项目：[VoodooHDA](https://github.com/chris1111/VoodooHDA-2.9.2-Clover-V15) [Wireless USB Adapter Clover](https://github.com/chris1111/Wireless-USB-Adapter-Clover)
- [zxystd](https://github.com/zxystd)开发的[itlwm](https://github.com/zxystd/itlwm) [IntelBluetoothFirmware](https://github.com/zxystd/IntelBluetoothFirmware)
- [lihaoyun6](https://github.com/lihaoyun6)提供的工具：[CPU-S](https://github.com/lihaoyun6/CPU-S) [macOS-Displays-icon](https://github.com/lihaoyun6/macOS-Displays-icon) [SidecarPatcher](https://github.com/lihaoyun6/SidecarPatcher)
- [sukka](https://github.com/SukkaW)更新维护的[从 Clover 到 OpenCore —— Clover 迁移 OpenCore 指南](https://blog.skk.moe/post/from-clover-to-opencore/)
- [xzhih](https://github.com/xzhih)提供的工具：[one-key-hidpi](https://github.com/xzhih/one-key-hidpi)
- [Bat.bat](https://github.com/williambj1)更新维护的[精解OpenCore](https://blog.daliansky.net/OpenCore-BootLoader.html)
- [shuiyunxc](https://github.com/shuiyunxc) 更新维护的[OpenCore配置错误、故障与解决办法](https://shuiyunxc.gitee.io/2020/04/06/Faults/index/)
- [athlonreg](https://github.com/athlonreg)更新维护的[OpenCore 0.5+ 部件补丁](https://blog.cloudops.ml/ocbook/) [Common-patches-for-hackintosh](https://github.com/athlonreg/Common-patches-for-hackintosh)
- [github.com](https://blog.daliansky.net/github.com)
- [码云 gitee.io](https://blog.daliansky.net/gitee.io)
- [扣钉 coding.net](https://blog.daliansky.net/coding.net)

## 参考及引用：

- https://deviwiki.com/wiki/Dell
- https://deviwiki.com/wiki/Dell_Wireless_1820A_(DW1820A)
- [Hervé](https://blog.daliansky.net/[https://osxlatitude.com/profile/4953-hervé/](https://osxlatitude.com/profile/4953-hervé/)) 更新的Broadcom 4350:https://osxlatitude.com/forums/topic/12169-bcm4350-cards-registry-of-cardslaptops-interop/
- [Hervé](https://blog.daliansky.net/[https://osxlatitude.com/profile/4953-hervé/](https://osxlatitude.com/profile/4953-hervé/)) 更新的DW1820A支持机型列表:https://osxlatitude.com/forums/topic/11322-broadcom-bcm4350-cards-under-high-sierramojave/
- [nickhx](https://osxlatitude.com/profile/129953-nickhx/) 提供的蓝牙驱动：https://osxlatitude.com/forums/topic/11540-dw1820a-for-7490-help/?do=findComment&comment=92833
- [xjn819](https://blog.xjn819.com/)： [使用OpenCore引导黑苹果](https://blog.xjn819.com/?p=543) [300系列主板正确使用AptioMemoryFix.efi的姿势(重写版）](https://blog.xjn819.com/?p=317)
- [insanelymac.com](https://www.insanelymac.com/)
- [tonymacx86.com](https://www.tonymacx86.com/)
- [远景论坛](http://bbs.pcbeta.com/)
- [applelife.ru](https://applelife.ru/)
- [olarila.com](https://www.olarila.com/)

文章转载：https://blog.daliansky.net/From-Clover-To-OpenCore.html
